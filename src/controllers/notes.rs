use axum::http::StatusCode;
use loco_rs::prelude::*;
use serde::Deserialize;

use crate::{
    dtos::{
        common::{ApiError, Page},
        notes::{CreateNote, NoteDto, NoteStats, UpdateNote},
    },
    models::{
        _entities::{notes::ActiveModel, users},
        notes::Model as NoteModel,
    },
};

/// Query parameters for the list endpoint. Filtering happens in the model;
/// the handler only parses.
#[derive(Debug, Deserialize)]
pub struct ListQuery {
    #[serde(flatten)]
    pub pagination: query::PaginationQuery,
    pub q: Option<String>,
    pub pinned: Option<bool>,
}

fn not_found(message: &str) -> Response {
    let error = ApiError {
        code: "not_found".to_string(),
        message: message.to_string(),
        details: None,
    };
    (StatusCode::NOT_FOUND, Json(error)).into_response()
}

fn bad_request(message: &str) -> Response {
    let error = ApiError {
        code: "invalid_request".to_string(),
        message: message.to_string(),
        details: None,
    };
    (StatusCode::BAD_REQUEST, Json(error)).into_response()
}

/// Resolve the caller from the JWT. Every handler that touches a note goes
/// through this, so no request can choose its own owner.
async fn current_user_id(auth: &auth::JWT, ctx: &AppContext) -> Result<i64> {
    let user = users::Model::find_by_pid(&ctx.db, &auth.claims.pid).await?;
    Ok(user.id)
}

#[debug_handler]
async fn list(
    auth: auth::JWT,
    State(ctx): State<AppContext>,
    Query(params): Query<ListQuery>,
) -> Result<Json<Page<NoteDto>>> {
    let user_id = current_user_id(&auth, &ctx).await?;
    let res = NoteModel::find_for_user(
        &ctx.db,
        user_id,
        &params.pagination,
        params.q.as_deref(),
        params.pinned,
    )
    .await?;
    Ok(Json(Page::from_query(res)))
}

#[debug_handler]
async fn stats(auth: auth::JWT, State(ctx): State<AppContext>) -> Result<Json<NoteStats>> {
    let user_id = current_user_id(&auth, &ctx).await?;
    let counts = NoteModel::counts_for_user(&ctx.db, user_id).await?;
    Ok(Json(NoteStats::from(counts)))
}

#[debug_handler]
async fn get_one(
    auth: auth::JWT,
    State(ctx): State<AppContext>,
    Path(id): Path<i64>,
) -> Result<Response> {
    let user_id = current_user_id(&auth, &ctx).await?;
    let Some(note) = NoteModel::find_for_user_by_id(&ctx.db, user_id, id).await? else {
        return Ok(not_found("note not found"));
    };
    Ok(Json(NoteDto::from(note)).into_response())
}

#[debug_handler]
async fn create(
    auth: auth::JWT,
    State(ctx): State<AppContext>,
    Json(params): Json<CreateNote>,
) -> Result<Response> {
    if params.title.trim().is_empty() {
        return Ok(bad_request("title cannot be empty"));
    }

    let user_id = current_user_id(&auth, &ctx).await?;
    let note = ActiveModel {
        user_id: Set(user_id),
        title: Set(params.title.trim().to_string()),
        body: Set(params.body),
        pinned: Set(params.pinned.unwrap_or(false)),
        ..Default::default()
    }
    .insert(&ctx.db)
    .await?;

    Ok((StatusCode::CREATED, Json(NoteDto::from(note))).into_response())
}

#[debug_handler]
async fn update(
    auth: auth::JWT,
    State(ctx): State<AppContext>,
    Path(id): Path<i64>,
    Json(params): Json<UpdateNote>,
) -> Result<Response> {
    if params.title.trim().is_empty() {
        return Ok(bad_request("title cannot be empty"));
    }

    let user_id = current_user_id(&auth, &ctx).await?;
    let Some(note) = NoteModel::find_for_user_by_id(&ctx.db, user_id, id).await? else {
        return Ok(not_found("note not found"));
    };

    let mut active = note.into_active_model();
    active.title = Set(params.title.trim().to_string());
    active.body = Set(params.body);
    active.pinned = Set(params.pinned.unwrap_or(false));

    let note = active.update(&ctx.db).await?;
    Ok(Json(NoteDto::from(note)).into_response())
}

#[debug_handler]
async fn remove(
    auth: auth::JWT,
    State(ctx): State<AppContext>,
    Path(id): Path<i64>,
) -> Result<Response> {
    let user_id = current_user_id(&auth, &ctx).await?;
    let Some(note) = NoteModel::find_for_user_by_id(&ctx.db, user_id, id).await? else {
        return Ok(not_found("note not found"));
    };

    note.into_active_model().delete(&ctx.db).await?;
    Ok(StatusCode::NO_CONTENT.into_response())
}

pub fn routes() -> Routes {
    Routes::new()
        .prefix("/api/notes")
        .add("/", get(list))
        .add("/", post(create))
        .add("/stats", get(stats))
        .add("/{id}", get(get_one))
        .add("/{id}", put(update))
        .add("/{id}", delete(remove))
}
