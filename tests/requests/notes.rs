use herman_loco_starter::{app::App, views::auth::LoginResponse};
use loco_rs::testing::prelude::*;
use serde_json::json;
use serial_test::serial;

use super::prepare_data;

/// Register and log in a user with an arbitrary email, so a test can have two
/// callers and prove that one cannot touch the other's data.
///
/// A macro rather than a function: the test server type lives in \`axum-test\`,
/// which this app does not depend on directly.
macro_rules! login_as {
    ($request:expr, $email:expr, $name:expr) => {{
        $request
            .post("/api/auth/register")
            .json(&json!({
                "name": $name,
                "email": $email,
                "password": "1234",
            }))
            .await;

        let response = $request
            .post("/api/auth/login")
            .json(&json!({
                "email": $email,
                "password": "1234",
            }))
            .await;

        let login: LoginResponse = serde_json::from_str(&response.text()).unwrap();
        login.token
    }};
}

macro_rules! json_body {
    ($response:expr) => {
        serde_json::from_str::<serde_json::Value>(&$response.text())
            .expect("response should be JSON")
    };
}

#[tokio::test]
#[serial]
async fn can_crud_own_notes() {
    request::<App, _, _>(|request, _ctx| async move {
        let token = login_as!(&request, "owner@example.com", "Owner");
        let (key, value) = prepare_data::auth_header(&token);

        let created = request
            .post("/api/notes")
            .add_header(key.clone(), value.clone())
            .json(&json!({
                "title": "First note",
                "body": "Written by the owner.",
                "pinned": true,
            }))
            .await;
        assert_eq!(created.status_code(), 201);
        let note = json_body!(created);
        let id = note["id"].as_i64().expect("note id");

        let listed = request
            .get("/api/notes")
            .add_header(key.clone(), value.clone())
            .await;
        assert_eq!(listed.status_code(), 200);
        let page = json_body!(listed);
        assert_eq!(page["total_items"], 1);
        assert_eq!(page["items"][0]["title"], "First note");

        let fetched = request
            .get(&format!("/api/notes/{id}"))
            .add_header(key.clone(), value.clone())
            .await;
        assert_eq!(fetched.status_code(), 200);

        let updated = request
            .put(&format!("/api/notes/{id}"))
            .add_header(key.clone(), value.clone())
            .json(&json!({
                "title": "First note, edited",
                "body": "Still the owner's.",
                "pinned": false,
            }))
            .await;
        assert_eq!(updated.status_code(), 200);
        assert_eq!(json_body!(updated)["title"], "First note, edited");

        let removed = request
            .delete(&format!("/api/notes/{id}"))
            .add_header(key.clone(), value.clone())
            .await;
        assert_eq!(removed.status_code(), 204);

        let gone = request
            .get(&format!("/api/notes/{id}"))
            .add_header(key, value)
            .await;
        assert_eq!(gone.status_code(), 404);
    })
    .await;
}

#[tokio::test]
#[serial]
async fn cannot_read_or_write_another_users_note() {
    request::<App, _, _>(|request, _ctx| async move {
        let owner = login_as!(&request, "owner@example.com", "Owner");
        let (owner_key, owner_value) = prepare_data::auth_header(&owner);
        let intruder = login_as!(&request, "intruder@example.com", "Intruder");
        let (intruder_key, intruder_value) = prepare_data::auth_header(&intruder);

        let created = request
            .post("/api/notes")
            .add_header(owner_key.clone(), owner_value.clone())
            .json(&json!({ "title": "Private", "body": "Owner only." }))
            .await;
        assert_eq!(created.status_code(), 201);
        let id = json_body!(created)["id"].as_i64().expect("note id");

        let read = request
            .get(&format!("/api/notes/{id}"))
            .add_header(intruder_key.clone(), intruder_value.clone())
            .await;
        assert_eq!(
            read.status_code(),
            404,
            "another user's note must look absent"
        );

        let update = request
            .put(&format!("/api/notes/{id}"))
            .add_header(intruder_key.clone(), intruder_value.clone())
            .json(&json!({ "title": "Hijacked", "body": "nope" }))
            .await;
        assert_eq!(update.status_code(), 404);

        let remove = request
            .delete(&format!("/api/notes/{id}"))
            .add_header(intruder_key, intruder_value)
            .await;
        assert_eq!(remove.status_code(), 404);

        // The owner still sees it, untouched.
        let owned = request
            .get(&format!("/api/notes/{id}"))
            .add_header(owner_key, owner_value)
            .await;
        assert_eq!(owned.status_code(), 200);
        assert_eq!(json_body!(owned)["title"], "Private");
    })
    .await;
}
