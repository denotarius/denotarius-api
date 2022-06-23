use std::env;

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
