mod utils;

use axum::{
    http::{self, Method, StatusCode},
    response::{Html, IntoResponse},
    routing::{get, post},
    Extension, Json, Router,
};
use axum_sqlite::Database;
use rusqlite::params;
use serde::{Deserialize, Serialize};
use serde_json::json;
use std::net::SocketAddr;
use std::time::SystemTime;
use tower_http::cors::CorsLayer;
use utils::{get_allowed_origins, get_port, iso8601, signal_shutdown};
use uuid::Uuid;

#[derive(Deserialize)]
struct CreateBatch {
    ipfs: String,
    pin_ipfs: bool,
}

struct Ipfs {
    cid: String,
    metadata: String,
}

#[derive(Serialize)]
struct User {
    id: u64,
    username: String,
}

#[tokio::main]

async fn main() {
    let database = Database::new(":memory:").unwrap();
    let connection = database.connection().unwrap();

    connection.execute(
        "CREATE TABLE IF NOT EXISTS batch (
            id INTEGER PRIMARY KEY,
            created_at TEXT,
            uuid TEXT,
            active INTEGER,
            status INTEGER
         )",
        [],
    );

    connection.execute(
        "CREATE TABLE IF NOT EXISTS document (
            id INTEGER PRIMARY KEY,
            ipfs_hash TEXT,
            metadata TEXT,
            FOREIGN KEY(id) REFERENCES batch(id)
         )",
        [],
    );

    let port = get_port();
    let origins = get_allowed_origins();
    let address = SocketAddr::from(([127, 0, 0, 1], port));
    let app = Router::new()
        .route("/", get(root))
        .route("/status", get(status))
        .route("/attestation/submit", post(attestation_submit))
        .route("/attestation/:order_id", get(attestation_order))
        .layer(database)
        .layer(
            CorsLayer::new()
                .allow_origin(origins)
                .allow_methods(vec![Method::GET, Method::POST])
                .allow_headers(vec![http::header::CONTENT_TYPE]),
        );

    axum::Server::bind(&address)
        .serve(app.into_make_service())
        .with_graceful_shutdown(signal_shutdown())
        .await
        .unwrap();
}

async fn root() -> Html<&'static str> {
    Html("Denotarius API")
}

async fn status() -> impl IntoResponse {
    const VERSION: &str = env!("CARGO_PKG_VERSION");

    let response = json!({
        "is_healthy": true,
        "version": VERSION
    });

    (StatusCode::OK, Json(response))
}

async fn attestation_submit(
    Extension(database): Extension<Database>,
    Json(payload): Json<CreateBatch>,
) -> impl IntoResponse {
    let connection = database.connection().unwrap();
    let ipfs: Vec<Ipfs> = serde_json::from_str(&payload.ipfs)?;
    let uuid = Uuid::new_v4();
    let now = SystemTime::now().clone().into();
    let time = iso8601(now);

    connection.execute(
        "INSERT INTO batch (created_at, uuid, active, status) VALUES (?1, ?2, ?3, ?4)",
        params![&time, &uuid, 0, 0],
    );

    for ipfs_item in ipfs.iter() {
        connection.execute(
            "INSERT INTO document (ipfs_hash, metadata) VALUES (?1, ?2)",
            params![&ipfs_item.cid, &ipfs_item.metadata],
        );
    }

    let response = json!({
        "order_id": uuid,
        "payment": {
            "address": "aaa",
            "amount": 10
        }
    });
    Ok("aa");
    (StatusCode::OK, Json(response));
}

async fn attestation_order(
    Extension(database): Extension<Database>,
    order_id: String,
) -> impl IntoResponse {
    let connection = database.connection().unwrap();

    let response = json!({
        "attestation_order": &order_id,
    });

    Json(response)
}
