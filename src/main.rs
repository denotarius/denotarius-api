// use blockfrost::{load, BlockFrostApi};
use serde_json::json;
use warp::reply::Json;
use warp::Filter;

#[tokio::main]

async fn main() {
    // status endpoint
    let status = warp::path("status").map(|| -> Json {
        const VERSION: &str = env!("CARGO_PKG_VERSION");
        let response = json!({
            "is_healthy": "ok",
            "version": VERSION
        });

        warp::reply::json(&response)
    });

    // // attestations

    // // attestation submit
    // let attestation_submit = warp::path("attestation/submit").map(|| -> Json {
    //     fn build_api() -> blockfrost::Result<BlockFrostApi> {
    //         let configurations = load::configurations_from_env()?;
    //         let project_id = configurations["project_id"].as_str().unwrap();
    //         let api = BlockFrostApi::new(project_id, Default::default());
    //         Ok(api)
    //     }
    //     let api = build_api()?;
    //     let genesis = api.genesis().await?;

    //     warp::reply::json(&genesis)
    // });

    // let routes = status.or(attestation_submit);

    warp::serve(routes).run(([127, 0, 0, 1], 3000)).await;
}
