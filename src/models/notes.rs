use chrono::{Duration, Utc};
use loco_rs::prelude::*;
use sea_orm::{entity::prelude::*, Condition, QueryFilter, QueryOrder};
use serde::{Deserialize, Serialize};

pub use super::_entities::notes::{ActiveModel, Column, Entity, Model};
pub type Notes = Entity;

#[async_trait::async_trait]
impl ActiveModelBehavior for ActiveModel {
    async fn before_save<C>(self, _db: &C, insert: bool) -> std::result::Result<Self, DbErr>
    where
        C: ConnectionTrait,
    {
        if !insert && self.updated_at.is_unchanged() {
            let mut this = self;
            this.updated_at = sea_orm::ActiveValue::Set(chrono::Utc::now().into());
            Ok(this)
        } else {
            Ok(self)
        }
    }
}

/// Counts the dashboard shows. A plain domain struct, not a wire type — the
/// controller maps it onto the notes DTO.
#[derive(Debug, Clone, Copy, Serialize, Deserialize)]
pub struct NoteCounts {
    pub total: u64,
    pub pinned: u64,
    pub updated_this_week: u64,
}

impl Model {
    /// One page of the user's notes: pinned first, then most recently updated.
    ///
    /// Filtering and ordering live here, not in the handler — a controller
    /// should read like a table of contents.
    pub async fn find_for_user(
        db: &DatabaseConnection,
        user_id: i64,
        pagination: &query::PaginationQuery,
        search: Option<&str>,
        pinned: Option<bool>,
    ) -> Result<query::PageResponse<Self>> {
        let mut condition = Condition::all().add(Column::UserId.eq(user_id));

        if let Some(pinned) = pinned {
            condition = condition.add(Column::Pinned.eq(pinned));
        }

        if let Some(term) = search.map(str::trim).filter(|term| !term.is_empty()) {
            condition = condition.add(
                Condition::any()
                    .add(Column::Title.contains(term))
                    .add(Column::Body.contains(term)),
            );
        }

        query::paginate(
            db,
            Entity::find()
                .order_by_desc(Column::Pinned)
                .order_by_desc(Column::UpdatedAt),
            Some(condition),
            pagination,
        )
        .await
    }

    /// A note by id, but only if this user owns it. Returning `None` for
    /// someone else's note keeps the API from leaking which ids exist.
    pub async fn find_for_user_by_id(
        db: &DatabaseConnection,
        user_id: i64,
        id: i64,
    ) -> ModelResult<Option<Self>> {
        Ok(Entity::find()
            .filter(Column::Id.eq(id))
            .filter(Column::UserId.eq(user_id))
            .one(db)
            .await?)
    }

    /// The three numbers on the dashboard, in three cheap queries.
    pub async fn counts_for_user(db: &DatabaseConnection, user_id: i64) -> ModelResult<NoteCounts> {
        let owned = || Entity::find().filter(Column::UserId.eq(user_id));

        let total = owned().count(db).await?;
        let pinned = owned().filter(Column::Pinned.eq(true)).count(db).await?;
        let since = Utc::now() - Duration::days(7);
        let updated_this_week = owned()
            .filter(Column::UpdatedAt.gte(since))
            .count(db)
            .await?;

        Ok(NoteCounts {
            total,
            pinned,
            updated_this_week,
        })
    }
}
