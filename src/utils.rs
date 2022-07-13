use chrono::prelude::{DateTime, Utc};
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

fn is_dev() -> bool {
    let is_dev = env::var("OPT_LEVEL").unwrap().to_string() == "DEBUG";

    is_dev
}

pub fn get_allowed_origins() -> Origin {
    let is_dev = is_dev();

    let origins = if is_dev {
        Origin::list(vec!["http://localhost:3000".parse().unwrap()])
    } else {
        Origin::list(vec!["https://denotarius.io".parse().unwrap()])
    };

    origins
}

pub fn iso8601(st: &std::time::SystemTime) -> String {
    let dt: DateTime<Utc> = st.clone().into();
    format!("{}", dt.format("%+"))
}
