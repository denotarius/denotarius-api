mod blockfrost;
mod utils;

use axum::{
    extract::{ContentLengthLimit, Multipart},
    http::{self, Method, StatusCode},
    response::{Html, IntoResponse},
    routing::{get, post},
    Json, Router,
};
use serde_json::json;
use std::net::SocketAddr;
use tower_http::cors::{CorsLayer, Origin};
use utils::{get_port, signal_shutdown};

#[tokio::main]

async fn main() {
    let port = get_port();
    let address = SocketAddr::from(([127, 0, 0, 1], port));
    let app = Router::new()
        .route("/", get(root))
        .route("/status", get(status))
        .route("/attestation/submit", post(attestation_submit))
        .route("/attestation/:order_id", get(attestation_order))
        .layer(
            CorsLayer::new()
                .allow_origin(Origin::list(vec![
                    // TODO: split prod / dev
                    "http://localhost:3000".parse().unwrap(),
                    "https://denottarius.io".parse().unwrap(),
                ]))
                .allow_methods([Method::GET])
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
    ContentLengthLimit(mut multipart): ContentLengthLimit<
        Multipart,
        {
            250 * 1024 * 1024 /* 250mb */
        },
    >,
) {
    while let Some(field) = multipart.next_field().await.unwrap() {
        let name = field.name().unwrap().to_string();
        let file_name = field.file_name().unwrap().to_string();
        let content_type = field.content_type().unwrap().to_string();
        let data = field.bytes().await.unwrap();

        println!(
            "Length of `{}` (`{}`: `{}`) is {} bytes",
            name,
            file_name,
            content_type,
            data.len()
        );
    }
}

async fn attestation_order(order_id: String) -> impl IntoResponse {
    let response = json!({
        "order_id": &order_id,
    });

    Json(response)
}
