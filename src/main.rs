// use blockfrost::{load, BlockFrostApi};
use serde_json::json;
use warp::reply::Json;
use warp::Filter;

#[tokio::main]

async fn main() {
    // root
    let root = warp::path::end().map(|| "Welcome to the denotarius API server");

    // status
    let status = warp::path("status").map(|| -> Json {
        const VERSION: &str = env!("CARGO_PKG_VERSION");
        let response = json!({
            "is_healthy": true,
            "version": VERSION
        });

        warp::reply::json(&response)
    });

    // attestation order
    let attestation_order =
        warp::path!("attestation" / String).map(|order_id| format!("Hello, {}!", order_id));

    // attestation submit
    let attestation_submit = warp::get()
        .and(warp::path("attestation"))
        .and(warp::path("submit"))
        .map(|| format!("Hello"));

    let routes = root.or(status).or(attestation_order).or(attestation_submit);

    warp::serve(routes).run(([127, 0, 0, 1], 3000)).await;
}
