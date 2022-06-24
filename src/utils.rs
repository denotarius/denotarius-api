use std::env;
use tower_http::cors::Origin;

pub async fn signal_shutdown() {
    tokio::signal::ctrl_c()
        .await
        .expect("expect tokio signal ctrl-c");
    println!("signal shutdown");
}

pub fn get_port() -> u16 {
    let default_port = 3001;
    let port = match env::var("PORT") {
        Ok(val) => match val.parse::<u16>() {
            Ok(port) => port,
            Err(_) => default_port,
        },
        Err(_) => default_port,
    };

    port
}

fn is_prod() -> bool {
    let is_prod = env::var("PROFILE").unwrap().to_string() == "release";

    is_prod
}

pub fn get_allowed_origins() -> Origin {
    let is_prod = is_prod();

    let origins = if is_prod {
        Origin::list(vec!["https://denottarius.io".parse().unwrap()])
    } else {
        Origin::list(vec!["https://www.denotarius.io".parse().unwrap()])
    };

    origins
}
