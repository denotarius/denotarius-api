use blockfrost::{load, BlockFrostApi, BlockFrostSettings, IpfsApi, IpfsSettings};

pub fn ipfs() -> blockfrost::Result<IpfsApi> {
    let configurations = load::configurations_from_env()?;
    let project_id = configurations["project_id"].as_str().unwrap();
    let api = IpfsApi::new(project_id, IpfsSettings::new());
    Ok(api)
}

pub fn api() -> blockfrost::Result<BlockFrostApi> {
    let configurations = load::configurations_from_env()?;
    let project_id = configurations["project_id"].as_str().unwrap();
    let api = BlockFrostApi::new(project_id, BlockFrostSettings::new());
    Ok(api)
}
