# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Changed

- database error handling

## [0.19.5] - 2022-05-18

### Fixed

- `/health` endpoint is not healthy while db is down

### Changed

- updated all node_modules

### Fixed

- `/txs/{hash}/pool_updates` endpoint was returning `[]` when the `reward_address` was not onchain (missing record in `stake_address` table)

## [0.19.4] - 2022-03-24

### Changed

- added `type` property to `/accounts/{stake_address}/rewards` endpoint
- openapi according to the new structure

### Fixed

- ogmios reconnect

## [0.19.3] - 2022-03-23

### Fixed

- ogmios freeze
- `epochs/{number}/stakes` to not use internal id (suffers from [interleaved autoincrement ids](https://github.com/input-output-hk/cardano-db-sync/issues/1088) during rollbacks/restarts)

## [0.19.2] - 2022-03-17

- `/accounts/{stake_address}/addresses/assets` assets on different addresses were displayed as independent records, not as one asset sum

## [0.19.1] - 2022-03-09

### Changed

- possibility to turn off ogmios websocket

## [0.19.0] - 2022-03-02

### Added

- `utils/txs/evaluate` endpoint

### Changed

- names of blockfrost related sql `blockfrost` -> `bf`
- `/pools/history/` to use `bf` table from dbsync
- updated all node_modules

### Fixed

- backend freezed when `Content-type: application/cbor` and URL was different than `tx/submit` (for example trailing slash)

## [0.18.0] - 2022-02-21

### Added

- vindler (The auth layer (read as The Outlawyer) ) support :tada: :tada: :tada: !

### Changed

- applied unicorn eslint plugin and recommended settings
- moved out all `AAA` and related logic (`logRequests`) to `blockfrost-vindler` repo

### Fixed

- application hang/freeze when other `Content-type` than `'Content-type: application/cbor'` is used in `/tx/submit`

## [0.17.4] - 2022-02-03

### Changed

- `undici` -> `http` in all instances of `fastify-http-proxy`

### Fixed

- error `TrailerMismatchError: Trailers does not match trailer header` during `/ipfs/gateway`

## [0.17.3] - 2022-01-30

### Fixed

- error `TrailerMismatchError: Trailers does not match trailer header` during `/ipfs/add` upload
  - https://github.com/fastify/fastify-http-proxy/issues/136
  - https://github.com/nodejs/undici/issues/581

### Changed

- split mainnet and testnet submitdb

## [0.17.2] - 2022-01-25

### Changed

- log request - using local time instead of NOW() postgreSQL function

## [0.17.1] - 2022-01-24

### Changed

- log request - insert requests in batches

## [0.17.0] - 2022-01-21

### Added

- `pgbouncer` (connection pooling) support for `analdb`, `submitdb` and `ipfsdb`

## [0.16.6] - 2022-01-20

### Changed

- `subitTx` plugin so that txs will also get inserted into `submitdb` for future resubmitting and handling (needed due to rollbacks)

### Fixed

- `addresses/{address}/total` and `/accounts/{stake_address}/addresses/total` incorrect Lovelace balances when multiple tokens have been received in the same transaction

## [0.16.5] - 2022-01-13

### Changed

- refactored DB related code
- moved IPFS from analdb to ipfsdb

## [0.16.4] - 2022-01-01

### Fixed

- `pools/{pool_id}/history` with pools with multiple margin/fixed cost updates

## [0.16.3] - 2021-12-22

### Fixed

- `onRequest` and `onResponse` logging

## [0.16.2] - 2021-12-21

### Added

- `blocks_epoch` to `pools/{pool_id}`

- split and refactored DB configs:
  - Cardano
  - IPFS
  - logRequests plugin

### Fixed

- accounting (correct mapping of requests to responses)

## [0.16.1] - 2021-12-17

### Changed

- silently drop `403` - TEMPORARY!!!

### Fixed

- release of db client in `/addresses/{address}/transactions` endpoint when using incorrect `from` and/or `to` parameters

## [0.16.0] - 2021-12-09

### Added

- `/blocks/{hash_or_number}/addresses` endpoint

### Changed

- refactored `/blocks` related endpoints
- `/utils/addresses/xpub/{xpub}/{role}/{index}` to use SDK `deriveAddress`

## [0.15.1] - 2021-12-09

### Fixed

- `addresses/{address}/utxos/{asset}` was failing due to missing JOIN needed in dbsync12

## [0.15.0] - 2021-12-07

### Added

- support for dbsync 12 !!! TRIPLE CAUTION !!!: INCOMPATIBLE WITH EARLIER DB SYNC VERSIONS
- `/addresses/{address}/extended` endpoint
- `/utils/addresses/xpub/{xpub}/{role}/{index}` endpoint
- `/pools/extended` endpoint

### Fixed

- `pools/{pool_id}/history` was incorrectly including reward type 'refund' to the sum of all rewards
- `pools/{pool_id}/history` to display only past epochs (current epoch was also displayed)

## [0.14.0] - 2021-11-18

### Added

- Dev mode for `SQLQueryManager` (calling `SQLQueryManager.get(query)` reloads the query from a file)
- `/addresses/{address}/extended` endpoint
- `/accounts/{stake_address}/addresses/total` endpoint

### Changed

- bumped `nixpkgs` fd8a7fd -> 9fe53ae

### Fixed

- Extra result (+1) when querying other than first and last pakges (<= should have been < to exclude extra result) in:
  - `epochs/{number}/stakes/{pool_id}`
  - `epochs/{number}/stakes`

## [0.13.1] - 2021-11-01

### Fixed

- normalization of ipfs project_id in `/ipfs/add` plugin (resulting in duplicates in anal ipfs table)

## [0.13.0] - 2021-10-30

### Added

- `block_time` property to:
  - `/addresses/{address}/transactions`
  - `/txs/{hash}`
  - `/assets/{asset}/transactions`

### Changed

- SQL (pagination) improvements of:
  - `/pools/{pool_id}/delegators`
  - `/assets/{asset}/txs`
  - `/assets/{asset}/transactions`

### Fixed

- fixed `null value in column "project_id" violates not-null constraint` issue when accessing nonrestricted endpoints such as `/health`, now there will be `bypassed` set as `project_id` when bypassing these endpoints
- Interleaving of first address (> should have been >= to include the first result) in:
  - `epochs/{number}/stakes/{pool_id}`
  - `epochs/{number}/stakes`

## [0.12.2] - 2021-10-15

### Changed

- `/assets/:hash` uses local token registry repository for asset metadata
- moved `metrics` service to `common`

### Fixed

- normalization of ipfs project_id in metrics service

## [0.12.1] - 2021-10-15

### Fixed

- normalization of ipfs project_id in ipfs service

## [0.12.0] - 2021-10-13

### Added

- `valid_contract` field to txs
- `script_hash` and `datum_hash` fields to `tx/:hash/redeemers`
- `datum_hash` field to `scripts/:hash/reedemers`
- `/scripts/datum/:hash` endpoint
- `/scripts/:hash/json` endpoint
- `/scripts/:hash/cbor` endpoint

### Changed

- `/epochs/{number}/parameters` - `collateral_percent` type from `number` to `integer`
- handling of 504 from submit API (now results in 425 Mempool Full (originally 425 Too Early)) in `/tx/submit`

### Fixed

- pagination issues (added wholesome workaround) related to boundary blocks (thank you Serokell) in both `/blocks/{hash_or_number}/next` and `/blocks/{hash_or_number}/previous` endpoints
- int32 checking for parameters (page was not working properly) so we avoid 500 when the parameter overflows PG integer value + introduced minimum limits for count
- reading SQL queries from a filesystem (previously read query from a file on every endpoint hit, now there is a fancy singleton that loads the files only once)

## [0.11.0] - 2021-10-07

### Added

- kill switch file
- `/addresses/{address}/utxos/{asset}` endpoint

### Changed

- removed dbsync workaround introduced in 0.1.5 https://github.com/input-output-hk/cardano-db-sync/issues/474
- conversion and handling of UTF-8 in `/assets/{asset}` was moved from SQL to TS (to avoid 500s on invalid UTF-8 asset names)

### Fixed

- better `metadata` handling of `/nutlink/{address}/` endpoint and introduced limit to 100kB

## [0.11.0] - 2021-10-07

### Added

- kill switch file
- `/addresses/{address}/utxos/{asset}` endpoint

### Changed

- removed dbsync workaround introduced in 0.1.5 https://github.com/input-output-hk/cardano-db-sync/issues/474
- conversion and handling of UTF-8 in `/assets/{asset}` was moved from SQL to TS (to avoid 500s on invalid UTF-8 asset names)

### Fixed

- better `metadata` handling of `/nutlink/{address}/` endpoint and introduced limit to 100kB

## [0.10.0] - 2021-09-29

### Added

- new properties `treasury` and `reserves` to `/network` endpoint
- int32 checking for parameters so we avoid 500 when the parameter overflows PG integer value
- `output_index` to `/txs/{hash}/utxos` outputs

### Changed

- `/txs/{tx}/metadata/cbor` and `metadata/txs/labels/{label}/cbor` property `cbor_metadata` is now deprecated in favour of `cbor` property
- `/health` is now accessible without token

### Fixed

- latest `onchain_metadata` in `/assets/{asset}` was taken from the last metadata update, even if this was a burn tx (metadata should only come from a mint, i.e. positive quantity tx)
- added missing `data_hash` to `/txs/{hash}/utxos` outputs

## [0.9.5] - 2021-09-17

### Fixed

- 500s in `/tx/submit` by increasing the timeout and number of connections to dbsync

## [0.9.4] - 2021-09-16

### Fixed

- 404 handling in pagination of `/nutlink/tickers/{ticker}` and `/nutlink/{address}/tickers/{ticker}` endpoints
- computation of balances related to stake addresses in `/accounts/{stake_address}` and `/pools/{pool_id}` and `/pools/{pool_id}/delegators` endpoints
- response of `202` -> `200` in `/tx/submit`
- error handling in `/tx/submit` (incorrect 500 when encountered 400 with malformed/non-JSON message)

## [0.9.3] - 2021-09-13

### Fixed

- type of image in `/assets/{asset}` based on https://cips.cardano.org/cips/cip25/

## [0.9.2] - 2021-09-12

### Fixed

- wrong error type when `project_id` is missing

## [0.9.1] - 2021-09-12

### Fixed

- uncaught error when `project_id` is missing

## [0.9.0] - 2021-09-12

### Added

- Alonzo support
- human readable prefix validation for `project_id` (mainnet,testnet,ipfs)
- script hash to / from bech32 address conversion

### Changed

- calls in order to be compatible with new db sync 11 schema

### Fixed

- ordering in `/txs/{hash}/withdrawals`
- execution duration of `/pools/{pool_id}/history`
- address balance now doesn't include UTxOs of invalid contracts
  for the following endpoints
  - `/addresses/{hash}`
  - `/accounts/{hash}/addresses/assets`
  - `/assets/{hash}/addresses`

## [0.8.7] - 2021-08-28

### Fixed

- remove `pgNative` driver as it crashes backend due to unhandled exception, see: https://github.com/brianc/node-pg-native/issues/49

## [0.8.6] - 2021-08-27

### Fixed

- correctly handle axios timeout errors in `/assets/{asset}` (previously caused another err that lead to 500)

## [0.8.5] - 2021-08-23

### Fixed

- ordering in `/ipfs/pin/list`
- error logging (do not log 404) in `/assets/{asset}`

## [0.8.4] - 2021-08-04

### Fixed

- introducing customizable token register url (proxied github)

## [0.8.3] - 2021-08-02

### Fixed

- limit calls for token API (query first GH, then token website to avoid 429)
- metadata exception in `/assets/{asset}` (removed hard fail with additional logic)
- reenabled Sentry in `/assets/{asset}`

## [0.8.2] - 2021-07-27

### Fixed

- metadata exception in `/assets/{asset}` (removed hard fail with additional logic)
- temporarily disabled Sentry in `/assets/{asset}`

## [0.8.1] - 2021-07-26

### Fixed

- integration tests when running against production (runInBand needed for correct metrics check)
- release of db client in logging when missing project_id

## [0.8.0] - 2021-07-26

### Added

- `network` endpoint
- more tests

### Changed

- improved auth and log error messages
- refactored utils and many tests

### Fixed

- network mismatch error messages
- endpoint parser when using queryparams in a call with endpoint without additional params (e.g. /pools?order=desc) - queryparams would get into DB in these cases (as endpoint)
- all `metrics` endpoints to return just last 30 days of data (previously infinity)

## [0.7.0] - 2021-07-15

### Added

- properties `tx_hash` and `output_index` to inputs of `/txs/{hash}/utxos` endpoint
- `stake_address` property to `/accounts/{stake_address}` endpoint
- `asset` property to `/assets/{asset}` endpoint
- `epoch` property to `/epochs/{number}/parameters` and `/epochs/latest/parameters` endpoints
- `pool` and `hex` property to `/pools/{pool_id}` endpoint

### Changed

- improved network mismatch error messages
- validation and error handling of 404 to more specific 400 on bad user inputs of addresses, stake addresses and pools

### Fixed

- pagination of `/accounts/{stake_address}/addresses/assets`
- possible BigInt leakages (explicit cast of every bigint in database)
- `/blocks/latest/txs` call (broken)
- handling of non-valid JSON in SMASH in `/pools/{pool_id}/metadata` endpoint

## [0.6.0] - 2021-07-01

### Added

- nutlink support
- `mint_or_burn_count` parameter to `/assets/{asset}` endpoint
- `asset_mint_or_burn_count` property to `/txs/{hash}` endpoint
- `decimals` support for `metadata` property to `/assets/{asset}` endpoint

### Fixed

- remove unnecessary sentry errors, keep just local logs in the events of mangled `onchain_metadata` in `/assets/{asset}` endpoint

## [0.5.1] - 2021-06-11

### Fixed

- cursor `from` and `to` into `/addresses/{address}/transactions` endpoint to function correctly also without block index (number after :)

## [0.5.0] - 2021-06-10

### Added

- additional query parameters `from` and `to` into `/addresses/{address}/transactions` endpoint
- `mir_cert_count` property to `/txs/{hash}`
- `/txs/{hash}/mirs` endpoint to display MIR details
- `/accounts/{stake_address}/withdrawals` and `/accounts/{stake_address}/mirs` endpoints

### Fixed

- `txs/{hash}/stakes` ordering from DESC to ASC

## [0.4.0] - 2021-06-02

### Added

- `/blocks/slot/{slot_number}` and `/blocks/epoch/{epoch_number}/slot/{slot_number}` endpoints to provide block details for a specific slot

### Changed

- `onchain_metadata` in `/assets/{asset}` endpoint to return anything (previously null), even on malformed data which do not follow https://github.com/cardano-foundation/CIPs/pull/85/files
- `/addresses/{address}/transactions` and `/assets/{asset}/transactions` in order to replace their `txs` counterparts which are just an array of tx hashes

## [0.3.1] - 2021-05-25

### Added

- Sentry to catch errors from internal try-catch in `/assets/{asset}` (otherwise uncaught as they don't trigger 500)

### Fixed

- `onchain_metadata` in `/assets/{asset}` endpoint to return null on malformed data which do not follow https://github.com/cardano-foundation/CIPs/pull/85/files

## [0.3.0] - 2021-05-25

### Changed

- SQL in almost all `/assets` endpoint to drastically speed them up by adjusting SQLs making it possible to utilize new index from ops https://github.com/blockfrost/blockfrost-ops/pull/269

### Added

- `/blocks/latest/txs` and `/epochs/latest/parameters` endpoint from https://github.com/blockfrost/openapi/pull/62/files
- `/accounts/{stake_address}/addresses/assets` endpoint to list all assets on addresses related to a given stake_address (account)

### Fixed

- IS_PRODUCTION environment variable
- `onchain_metadata` in `/assets/{asset}/total` endpoint that could have been missing in cases when metdata was updated in other transaction than in the latest mint related transaction
- incorrect case variable in ordering of `/blocks/{hash_or_number}/txs` endpoint

## [0.2.6] - 2021-05-09

### Fixed

- release of db client in `/addresses/{address}/total` and `/epochs/{number}/next` endpoints

## [0.2.5] - 2021-05-01

### Fixed

- computation (SQL) of `cdbsync_workaround` (just in pools section) that was affecting `live_pledge` in `/pools/{pool_id}` endpoint

## [0.2.4] - 2021-04-29

### Fixed

- a lot of properties that should have been mandatory (they resulted in possible `undefined` types when types were generated) - see https://github.com/blockfrost/openapi/pull/50

## [0.2.3] - 2021-04-26

### Fixed

- release of smash db client on 404 errors and empty metadata - i.e. {} in `/pools/{pool}/metadata`

## [0.2.2] - 2021-04-24

### Added

- `max`, `connectionTimeoutMillis`, `idleTimeoutMillis` to configuration file
- default values for `max`, `connectionTimeoutMillis`, `idleTimeoutMillis` when no values are provided through configuration file

### Changed

- default values of `connectionTimeoutMillis` to 5000 and `idleTimeoutMillis` to 10000

## [0.2.1] - 2021-04-23

### Added

- `connectionTimeoutMillis` and `idleTimeoutMillis` to analdb pool settings that should aid when analdb becomes sluggish but doesn't completely die
- errors when calling ipfs endpoints on cardano backend
- `block_height` to `/txs/{hash}` endpoint

## [0.2.0] - 2021-04-17

### Added

- `onchain_metadata` to `/assets/{asset} endpoint`
- `slot` parameter to `/txs/{hash}` endpoint
- `cert_index` parameter to all relevant endpoints:
  - `/txs/{hash}/stakes`
  - `/txs/{hash}/pool_updates`
  - `/txs/{hash}/pool_retires`

### Changed

- deprecated `index` in favour of `cert_index` in `/txs/{hash}/delegations`

### Fixed

- `/epochs/{number}/parameters` returning 500 instead of 404 due to incorrect client release https://github.com/blockfrost/backend/pull/292

## [0.1.9] - 2021-04-04

### Added

- `/assets/{asset}/addresses` lists of the addresses holding a specific asset
- `/assets/policy/{policy_id}` lists the assets minted under a specific policy

### Changed

- `tx_index` in `/addresses/{address}/utxos` - it has been deprecated in favour of `output_index`
- `/` endpoint property `version` type number -> string
- `fastify-postgres` on logRequests call to `pg-promise`

### Fixed

- all backends should continue to serve data on anal unavailability (maintenance/crash/shutdown/reboot)

## [0.1.8] - 2021-03-31

### Added

- `/ipfs/` endpoints

### Changed

- `/assets/{asset}` `metadata` to adhere to upstream

### Fixed

- `/tx/submit` error handling (standardized error reply for 400)
- `/assets/{asset}` handling of `metadata`

## [0.1.6] - 2021-03-19

### Added

- `/accounts/{stake_address}/addresses` which returns the list of on-chain addresses associated with a specific stake key
- `402` response to mark oversubscription (projects exceeded their daily subscription plan)

### Changed

- `/tx/submit` endpoint, which now accepts CBOR encoded serialized transaction instead of a binary blob

### Fixed

- functionality of rate limiting (429), oversubscription (402) and banning (418)

## [0.1.5] - 2021-03-12

### Added

- `/assets/{asset}/txs` endpoint to list all transactions of a given asset
- Owners to `/txs/{HASH}/pool_updates` endpoint

### Changed

- Altered functionality of `active_epoch` in `/accounts/{stake_address}` to better match its changed functionality. When account is deregistered (`active` field is `false`), this field contains the epoch number of deregistration
- `reward_address` -> `reward_account` in `/pools/{pool_id}` and `/txs/{hash}/pool_updates` endpoints as the previous name was misleading and incorrect
- Deprecated `unit` field of not yet used `metadata` in `/assets/{asset}` endpoint

### Fixed

- workaround for [Cardano DB Sync issue](https://github.com/input-output-hk/cardano-db-sync/issues/474). Endpoints:
  - `/pools/{pool_id}`
    - `live_stake`
    - `live_size`
    - `live_saturation`
    - `live_pledge`
  - `/pools/{pool_id}/delegators`
    - `live_stake`
  - `/accounts/{stake_address}`
    - `controlled_amount`
    - `withdrawable_amount`
- Calculation `live_stake` in `/pools/{pool_id}/delegators` endpoint. Other endpoints were not affected
- Some pools were displaying slightly higher `live_stake` values and thus also very slightly skewed `live_size` and `live_saturation` calculations in `/pools/{pool_id}` endpoint
- `active_epoch` in `/accounts/{stake_address}` was previously displaying epoch of delegation, not epoch of de/registration

## [0.1.4] - 2021-03-08

### Fixed

- `/txs/{hash}` types of `invalid_before` and `invalid_hereafter` changed from NUMBER to string as the value may overflow

## [0.1.2] - 2021-03-05

### Changed

- `/pools` endpoint now also includes retiring (not yet retired) pools
- All `/addresses/{address}` endpoints now also accept `payment_cred` in Bech32 format
- All `/pools/{pool_id}` endpoints now also accept `pool_id` in Hex format

### Fixed

- `/pools/retired` and `/pools/retiring` are now sorted first by `epoch` and then `tx_id` as it was causing inconsistencies when pool announced its retirement way back in the past (in this case, the retired pool could be inserted in the middle of already retired pools)
- duplicates in `/pools`

## [0.1.1] - 2021-02-26

### Added

- New items to multiple `/epochs` endpoints
  - `first_block_time` - Marking first block of the epoch
  - `last_block_time` - Marking last block of the epoch
  - `active_stake` - Sum of all active stakes of the epoch
- Pagination for `/metadata/txs/labels` endpoint

### Fixed

- Rename `active_pledge` → `live_pledge` in `/pools/{pool_id}`
- `start_time` and `end_time` now display correct values (previously `first_block_time` and `last_block_time` values were shown)

### Changed

- Unify item names in `/epochs/`
  - `blocks_count` → `block_count`
  - `txs_count` → `tx_count`
  - `txs_sum` → `output`
  - `fees_sum` → `fees`
- Rename `acronym` → `ticker` in metadata of `/assets/{asset}`

## [0.1.0] - 2021-02-23

### Added

- Initial release
