use sea_orm::prelude::DateTimeWithTimeZone;
use ts_rs::TS;

use crate::models::notes::NoteCounts;

#[derive(serde::Serialize, serde::Deserialize, TS)]
#[ts(export, export_to = "../frontend/src/bindings/")]
pub struct NoteDto {
    #[ts(type = "number")]
    pub id: i64,
    pub title: String,
    pub body: String,
    pub pinned: bool,
    #[ts(type = "string")]
    pub created_at: DateTimeWithTimeZone,
    #[ts(type = "string")]
    pub updated_at: DateTimeWithTimeZone,
}

impl From<crate::models::_entities::notes::Model> for NoteDto {
    fn from(m: crate::models::_entities::notes::Model) -> Self {
        Self {
            id: m.id,
            title: m.title,
            body: m.body,
            pinned: m.pinned,
            created_at: m.created_at,
            updated_at: m.updated_at,
        }
    }
}

/// What a client may send. No `user_id`: the owner comes from the JWT in the
/// handler, never from the request body.
#[derive(serde::Serialize, serde::Deserialize, TS)]
#[ts(export, export_to = "../frontend/src/bindings/")]
pub struct CreateNote {
    pub title: String,
    pub body: String,
    pub pinned: Option<bool>,
}

#[derive(serde::Serialize, serde::Deserialize, TS)]
#[ts(export, export_to = "../frontend/src/bindings/")]
pub struct UpdateNote {
    pub title: String,
    pub body: String,
    pub pinned: Option<bool>,
}

#[derive(serde::Serialize, serde::Deserialize, TS)]
#[ts(export, export_to = "../frontend/src/bindings/")]
pub struct NoteStats {
    #[ts(type = "number")]
    pub total: u64,
    #[ts(type = "number")]
    pub pinned: u64,
    #[ts(type = "number")]
    pub updated_this_week: u64,
}

impl From<NoteCounts> for NoteStats {
    fn from(counts: NoteCounts) -> Self {
        Self {
            total: counts.total,
            pinned: counts.pinned,
            updated_this_week: counts.updated_this_week,
        }
    }
}
