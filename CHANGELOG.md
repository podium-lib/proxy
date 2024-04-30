## [5.0.11](https://github.com/podium-lib/proxy/compare/v5.0.10...v5.0.11) (2024-04-30)


### Bug Fixes

* **deps:** update dependency abslog to v2.4.3 ([21bd894](https://github.com/podium-lib/proxy/commit/21bd894068da093cc15ffa747cf092be732e8b64))

## [5.0.10](https://github.com/podium-lib/proxy/compare/v5.0.9...v5.0.10) (2024-04-30)


### Bug Fixes

* **deps:** update dependency @podium/schemas to v5.0.1 ([0c22389](https://github.com/podium-lib/proxy/commit/0c223893e6978a0f6f074e3132d5e047a483ddae))

## [5.0.9](https://github.com/podium-lib/proxy/compare/v5.0.8...v5.0.9) (2024-04-23)


### Bug Fixes

* **deps:** update dependency @podium/utils to v5.0.4 ([3426744](https://github.com/podium-lib/proxy/commit/3426744ce31c004b4c044fe8c1812dbab063032e))

## [5.0.8](https://github.com/podium-lib/proxy/compare/v5.0.7...v5.0.8) (2024-04-12)


### Bug Fixes

* **deps:** update dependency @podium/utils to v5.0.3 ([a8d4288](https://github.com/podium-lib/proxy/commit/a8d42885b7ef231d6834363ab39a045501fa4ddd))

## [5.0.7](https://github.com/podium-lib/proxy/compare/v5.0.6...v5.0.7) (2024-04-11)


### Bug Fixes

* **deps:** update dependency abslog to v2.4.2 ([546e998](https://github.com/podium-lib/proxy/commit/546e998682f8dbe87a572fc775f597ebfa37e12d))

## [5.0.6](https://github.com/podium-lib/proxy/compare/v5.0.5...v5.0.6) (2024-04-10)


### Bug Fixes

* **deps:** update dependency abslog to v2.4.1 ([de80ebd](https://github.com/podium-lib/proxy/commit/de80ebda4623f47a2b7d2597bf79e90a88c3420e))

## [5.0.5](https://github.com/podium-lib/proxy/compare/v5.0.4...v5.0.5) (2024-04-07)


### Bug Fixes

* **deps:** update dependency path-to-regexp to v6.2.2 ([806e92a](https://github.com/podium-lib/proxy/commit/806e92a6807b2d9e0c0321c6559974f5589380b8))

## [5.0.4](https://github.com/podium-lib/proxy/compare/v5.0.3...v5.0.4) (2024-03-01)


### Bug Fixes

* **types:** add missing name argument to proxy register types ([#269](https://github.com/podium-lib/proxy/issues/269)) ([98f1bd2](https://github.com/podium-lib/proxy/commit/98f1bd21fe8b0d4c1bd6e977bb349062315861e9))

## [5.0.3](https://github.com/podium-lib/proxy/compare/v5.0.2...v5.0.3) (2024-02-01)


### Bug Fixes

* **deps:** update dependency @podium/utils to v5.0.2 ([5c6c646](https://github.com/podium-lib/proxy/commit/5c6c6462de866059c783f6b08846f02c2da44752))

## [5.0.2](https://github.com/podium-lib/proxy/compare/v5.0.1...v5.0.2) (2023-12-07)


### Bug Fixes

* Add name to .register() ([733831f](https://github.com/podium-lib/proxy/commit/733831ff2d2c22d52ef3f4b494abb7e7e98f241e))
* **deps:** update dependency @podium/utils to v5.0.1 ([5bfab14](https://github.com/podium-lib/proxy/commit/5bfab141155cfe0443b2e7b359f7600d200ad6fa))

## [5.0.1](https://github.com/podium-lib/proxy/compare/v5.0.0...v5.0.1) (2023-12-06)


### Bug Fixes

* export default now that package is esm ([e7224be](https://github.com/podium-lib/proxy/commit/e7224beb2e71792d69b615e709c79329dfb8299f))

# [5.0.0](https://github.com/podium-lib/proxy/compare/v4.2.86...v5.0.0) (2023-11-28)


### Bug Fixes

* Update @podium/utils to version 5.0.0-next.1 ([29da2c9](https://github.com/podium-lib/proxy/commit/29da2c9da76f35a772eb5e8ed874b660bf99186e))
* Use v5 versions of @podium/utils and @podium/schema ([a37ca1f](https://github.com/podium-lib/proxy/commit/a37ca1f151e7e334856b5fb09e5dfe122724280b))


### Features

* Convert to ESM ([#150](https://github.com/podium-lib/proxy/issues/150)) ([9f3c2d3](https://github.com/podium-lib/proxy/commit/9f3c2d3e3474889b73706f4e1cf5d571ed2a42ee))
* Drop node 10.x support ([bcd95a1](https://github.com/podium-lib/proxy/commit/bcd95a144d54861fa7d7e28c0298a87463902bc1))
* Support manifest with array of proxy endpoints ([#226](https://github.com/podium-lib/proxy/issues/226)) ([330384b](https://github.com/podium-lib/proxy/commit/330384bb5179bc21c9a4d2518fa349e801855880))
* Use ES private properties instead of Symbols and defineProperty() for privacy ([#84](https://github.com/podium-lib/proxy/issues/84)) ([37fd140](https://github.com/podium-lib/proxy/commit/37fd1406975a046e0f79b50858c04bd13ca46ba0))


### BREAKING CHANGES

* Convert from CommonJS to ESM

* feat: Convert to ESM

Co-authored-by: Trygve Lie <trygve.lie@finn.no>
* Due to dropping node 10.x support we use ES private properties instead of Symbols and `.defineProperty()`.

Co-authored-by: Trygve Lie <trygve.lie@finn.no>
* Only support node 12 and 14.

# [5.0.0-next.8](https://github.com/podium-lib/proxy/compare/v5.0.0-next.7...v5.0.0-next.8) (2023-11-27)


### Bug Fixes

* add type definition ([b1cfe83](https://github.com/podium-lib/proxy/commit/b1cfe831b1a1e4fa81cd85a4076370d4fa390103))
* **deps:** update dependency @metrics/client to v2.5.1 ([5083a69](https://github.com/podium-lib/proxy/commit/5083a693bf4d46a86cf062845a1891c0286db592))
* **deps:** update dependency @metrics/client to v2.5.2 ([d8f087b](https://github.com/podium-lib/proxy/commit/d8f087b26a8894da0ab504e13c898c46c262691c))
* **deps:** update dependency @podium/schemas to v4.1.33 ([7cded60](https://github.com/podium-lib/proxy/commit/7cded6035a5ca20034d715f08ef160ab775adbf3))
* **deps:** update dependency @podium/schemas to v4.1.34 ([ebef830](https://github.com/podium-lib/proxy/commit/ebef830c6fdcd93673c53a2fc340d7ff7cd4bb56))
* **deps:** update dependency @podium/utils to v4.4.37 ([18301ac](https://github.com/podium-lib/proxy/commit/18301ac58177f115feb6a4a81054938791020140))
* **deps:** update dependency @podium/utils to v4.4.38 ([01cbddf](https://github.com/podium-lib/proxy/commit/01cbddf5123ca29a81c6ea34c1a359ab98720bb2))
* **deps:** update dependency @podium/utils to v4.4.39 ([eec54de](https://github.com/podium-lib/proxy/commit/eec54dedf70cc95c7c06d8fec00316258c18e4bb))
* **deps:** update dependency @podium/utils to v4.4.41 ([35d0ca5](https://github.com/podium-lib/proxy/commit/35d0ca59572d59e6b1d53c47fb04314afe39caa0))
* **deps:** update dependency @podium/utils to v4.5.1 ([04a497b](https://github.com/podium-lib/proxy/commit/04a497bd9b2ba1cd76b454a1fa6466cb0c30f47b))
* **deps:** update podium packages ([06ecbcd](https://github.com/podium-lib/proxy/commit/06ecbcd40ccd1d3fa9f6d83fd15d442cd7cb00ca))

## [4.2.86](https://github.com/podium-lib/proxy/compare/v4.2.85...v4.2.86) (2023-11-20)


### Bug Fixes

* **deps:** update dependency @podium/utils to v4.5.1 ([04a497b](https://github.com/podium-lib/proxy/commit/04a497bd9b2ba1cd76b454a1fa6466cb0c30f47b))

## [4.2.85](https://github.com/podium-lib/proxy/compare/v4.2.84...v4.2.85) (2023-11-17)


### Bug Fixes

* **deps:** update podium packages ([06ecbcd](https://github.com/podium-lib/proxy/commit/06ecbcd40ccd1d3fa9f6d83fd15d442cd7cb00ca))

## [4.2.84](https://github.com/podium-lib/proxy/compare/v4.2.83...v4.2.84) (2023-10-19)


### Bug Fixes

* **deps:** update dependency @podium/utils to v4.4.41 ([35d0ca5](https://github.com/podium-lib/proxy/commit/35d0ca59572d59e6b1d53c47fb04314afe39caa0))

## [4.2.83](https://github.com/podium-lib/proxy/compare/v4.2.82...v4.2.83) (2023-10-09)


### Bug Fixes

* add type definition ([b1cfe83](https://github.com/podium-lib/proxy/commit/b1cfe831b1a1e4fa81cd85a4076370d4fa390103))

## [4.2.82](https://github.com/podium-lib/proxy/compare/v4.2.81...v4.2.82) (2023-09-19)


### Bug Fixes

* **deps:** update dependency @metrics/client to v2.5.2 ([d8f087b](https://github.com/podium-lib/proxy/commit/d8f087b26a8894da0ab504e13c898c46c262691c))

## [4.2.81](https://github.com/podium-lib/proxy/compare/v4.2.80...v4.2.81) (2023-09-14)


### Bug Fixes

* **deps:** update dependency @metrics/client to v2.5.1 ([5083a69](https://github.com/podium-lib/proxy/commit/5083a693bf4d46a86cf062845a1891c0286db592))

## [4.2.80](https://github.com/podium-lib/proxy/compare/v4.2.79...v4.2.80) (2023-01-04)


### Bug Fixes

* **deps:** update dependency @podium/utils to v4.4.39 ([eec54de](https://github.com/podium-lib/proxy/commit/eec54dedf70cc95c7c06d8fec00316258c18e4bb))

## [4.2.79](https://github.com/podium-lib/proxy/compare/v4.2.78...v4.2.79) (2023-01-04)


### Bug Fixes

* **deps:** update dependency @podium/schemas to v4.1.34 ([ebef830](https://github.com/podium-lib/proxy/commit/ebef830c6fdcd93673c53a2fc340d7ff7cd4bb56))

## [4.2.78](https://github.com/podium-lib/proxy/compare/v4.2.77...v4.2.78) (2022-12-07)


### Bug Fixes

* **deps:** update dependency @podium/utils to v4.4.38 ([01cbddf](https://github.com/podium-lib/proxy/commit/01cbddf5123ca29a81c6ea34c1a359ab98720bb2))

## [4.2.77](https://github.com/podium-lib/proxy/compare/v4.2.76...v4.2.77) (2022-11-14)


### Bug Fixes

* **deps:** update dependency @podium/utils to v4.4.37 ([18301ac](https://github.com/podium-lib/proxy/commit/18301ac58177f115feb6a4a81054938791020140))

## [4.2.76](https://github.com/podium-lib/proxy/compare/v4.2.75...v4.2.76) (2022-11-14)


### Bug Fixes

* **deps:** update dependency @podium/schemas to v4.1.33 ([7cded60](https://github.com/podium-lib/proxy/commit/7cded6035a5ca20034d715f08ef160ab775adbf3))

## [4.2.75](https://github.com/podium-lib/proxy/compare/v4.2.74...v4.2.75) (2022-05-07)


### Bug Fixes

* **deps:** update dependency path-to-regexp to v6.2.1 ([9dcda20](https://github.com/podium-lib/proxy/commit/9dcda204a18cf86ff487dacb8da94b909ba7ad9c))

# [5.0.0-next.7](https://github.com/podium-lib/proxy/compare/v5.0.0-next.6...v5.0.0-next.7) (2022-09-21)


### Features

* Support manifest with array of proxy endpoints ([#226](https://github.com/podium-lib/proxy/issues/226)) ([330384b](https://github.com/podium-lib/proxy/commit/330384bb5179bc21c9a4d2518fa349e801855880))

# [5.0.0-next.6](https://github.com/podium-lib/proxy/compare/v5.0.0-next.5...v5.0.0-next.6) (2022-05-09)


### Bug Fixes

* **deps:** update dependency @podium/schemas to v4.1.17 ([5295541](https://github.com/podium-lib/proxy/commit/529554128a2edc430a5b1af7a449f8164d779563))
* **deps:** update dependency @podium/schemas to v4.1.18 ([99cdf06](https://github.com/podium-lib/proxy/commit/99cdf0630e6b3d21db890a7b780d76777b054ac0))
* **deps:** update dependency @podium/schemas to v4.1.19 ([6f197e7](https://github.com/podium-lib/proxy/commit/6f197e796c39ea11b89002f4957b478d492bd458))
* **deps:** update dependency @podium/schemas to v4.1.20 ([102f457](https://github.com/podium-lib/proxy/commit/102f457836ef12d633d82f5eb783d67824f91cd3))
* **deps:** update dependency @podium/schemas to v4.1.21 ([1f38ae1](https://github.com/podium-lib/proxy/commit/1f38ae1cfe9588ae1a8c15eea75ff8b03012c15c))
* **deps:** update dependency @podium/schemas to v4.1.22 ([512d8cc](https://github.com/podium-lib/proxy/commit/512d8cc37a3780ecee3820e29a734948010c8759))
* **deps:** update dependency @podium/schemas to v4.1.23 ([3c1402d](https://github.com/podium-lib/proxy/commit/3c1402de376e437776c326edef1f7a4ae54c703d))
* **deps:** update dependency @podium/schemas to v4.1.24 ([b6a58e2](https://github.com/podium-lib/proxy/commit/b6a58e2694cae80de2aed1a23b895ec467253614))
* **deps:** update dependency @podium/schemas to v4.1.25 ([4bd3d10](https://github.com/podium-lib/proxy/commit/4bd3d10b37d6ef8d8758f679db1353ea3fc2a91d))
* **deps:** update dependency @podium/schemas to v4.1.26 ([78a68b6](https://github.com/podium-lib/proxy/commit/78a68b6f5cec3b1fa70dbe8393115ea5c29adc32))
* **deps:** update dependency @podium/schemas to v4.1.27 ([83fcf95](https://github.com/podium-lib/proxy/commit/83fcf95e4c765cac52e4ab835694f23f504400cf))
* **deps:** update dependency @podium/schemas to v4.1.28 ([18122b5](https://github.com/podium-lib/proxy/commit/18122b56fc8adb08ac9213657389f5358469fabf))
* **deps:** update dependency @podium/schemas to v4.1.29 ([8b3aa2e](https://github.com/podium-lib/proxy/commit/8b3aa2ea18c002c245637a987d1c1d482f9f4478))
* **deps:** update dependency @podium/schemas to v4.1.30 ([9b9762f](https://github.com/podium-lib/proxy/commit/9b9762fad68e1128b70ab16717f537c0c8a63389))
* **deps:** update dependency @podium/schemas to v4.1.31 ([ceec640](https://github.com/podium-lib/proxy/commit/ceec6402c540e9d28afa1ccfa8f265a74c0e768f))
* **deps:** update dependency @podium/utils to v4.4.18 ([bfe44f2](https://github.com/podium-lib/proxy/commit/bfe44f21df74fcae60f2bda46bc2e3b58352c498))
* **deps:** update dependency @podium/utils to v4.4.19 ([7401099](https://github.com/podium-lib/proxy/commit/7401099d7f547b1fa85d31111c8832587d27ac93))
* **deps:** update dependency @podium/utils to v4.4.20 ([f795a85](https://github.com/podium-lib/proxy/commit/f795a857b77624b328f8127f39dc36061b724bec))
* **deps:** update dependency @podium/utils to v4.4.21 ([18e3764](https://github.com/podium-lib/proxy/commit/18e3764d133e07fa60be3e16977b9f4b88f33f3a))
* **deps:** update dependency @podium/utils to v4.4.22 ([3a1893a](https://github.com/podium-lib/proxy/commit/3a1893af3fb8ae7dd527cf818eed60d7d41cdcd4))
* **deps:** update dependency @podium/utils to v4.4.23 ([d10d26c](https://github.com/podium-lib/proxy/commit/d10d26c8a0f92926eb2846d4c20f3ed8f93ef0e9))
* **deps:** update dependency @podium/utils to v4.4.24 ([ee30140](https://github.com/podium-lib/proxy/commit/ee30140395eae61ab8d0ca486fa77cf66cc73040))
* **deps:** update dependency @podium/utils to v4.4.25 ([e8be328](https://github.com/podium-lib/proxy/commit/e8be328175a6d5012c5727bc6466eb920aaf65b0))
* **deps:** update dependency @podium/utils to v4.4.26 ([1867065](https://github.com/podium-lib/proxy/commit/18670658852f1d9489f692ea46787d21b4edd781))
* **deps:** update dependency @podium/utils to v4.4.27 ([#180](https://github.com/podium-lib/proxy/issues/180)) ([a99b27a](https://github.com/podium-lib/proxy/commit/a99b27ae4ed9a5c3db8da72d982129051ef0a418))
* **deps:** update dependency @podium/utils to v4.4.28 ([7da28db](https://github.com/podium-lib/proxy/commit/7da28db288e727e38a758e40c8294d08aca9b2ab))
* **deps:** update dependency @podium/utils to v4.4.29 ([5274f30](https://github.com/podium-lib/proxy/commit/5274f30b2750add105fcba232674a05a11fb1178))
* **deps:** update dependency @podium/utils to v4.4.30 ([1da6d7b](https://github.com/podium-lib/proxy/commit/1da6d7b72d2cbb6d7bdfcba5d4b5e2611e5221b4))
* **deps:** update dependency @podium/utils to v4.4.31 ([96cd22c](https://github.com/podium-lib/proxy/commit/96cd22c7569858c951feebba8d4b1541b1ec8e28))
* **deps:** update dependency @podium/utils to v4.4.32 ([34f3e3d](https://github.com/podium-lib/proxy/commit/34f3e3d15cc67935a0b6e4621c5dc46eb825bf55))
* **deps:** update dependency @podium/utils to v4.4.33 ([5694777](https://github.com/podium-lib/proxy/commit/5694777fc25663560b1b0cc4a3ac51c391d96139))
* **deps:** update dependency @podium/utils to v4.4.34 ([619729e](https://github.com/podium-lib/proxy/commit/619729e83a243f8477a386bd3d1629bf901bfbc4))
* **deps:** update dependency @podium/utils to v4.4.35 ([ec7b5a5](https://github.com/podium-lib/proxy/commit/ec7b5a5dfcd57a0e03f96f49c123c87a68e5d03e))
* **deps:** update dependency path-to-regexp to v6.2.1 ([9dcda20](https://github.com/podium-lib/proxy/commit/9dcda204a18cf86ff487dacb8da94b909ba7ad9c))
* **deps:** update podium packages ([a2fd327](https://github.com/podium-lib/proxy/commit/a2fd327896bbfe282f311ab3363008c395caefbd))
* remove trailer header if present when proxying ([9698a40](https://github.com/podium-lib/proxy/commit/9698a40df081217ce142d4de71f929baaa339cdf))

# [5.0.0-next.5](https://github.com/podium-lib/proxy/compare/v5.0.0-next.4...v5.0.0-next.5) (2021-05-04)

### Bug Fixes

* **deps:** update dependency @podium/schemas to v4.0.4 ([9fdbee6](https://github.com/podium-lib/proxy/commit/9fdbee6657ce48af72ddbb1987ea8af6340b2164))
* **deps:** update dependency @podium/schemas to v4.0.5 ([8a966c0](https://github.com/podium-lib/proxy/commit/8a966c006c61422ac1b5ebaf970c2a67da228bdf))
* **deps:** update dependency @podium/schemas to v4.0.7 ([f6bb236](https://github.com/podium-lib/proxy/commit/f6bb236a759be3fda16b524c4f5bb514aad5014c))
* **deps:** update dependency @podium/schemas to v4.1.0 ([6c6aa2d](https://github.com/podium-lib/proxy/commit/6c6aa2d1a56910702529fd167a1f44ad57f259e8))
* **deps:** update dependency @podium/schemas to v4.1.1 ([6ba8a0c](https://github.com/podium-lib/proxy/commit/6ba8a0c4797593f8870505f9ea01c60e710cb89c))
* **deps:** update dependency @podium/schemas to v4.1.10 ([6f58fa8](https://github.com/podium-lib/proxy/commit/6f58fa8eb2c4aeb8b80b6e18affe5c3210bcfd63))
* **deps:** update dependency @podium/schemas to v4.1.11 ([8687e5d](https://github.com/podium-lib/proxy/commit/8687e5d1921b2d147626c1710ab92eb090e9142a))
* **deps:** update dependency @podium/schemas to v4.1.13 ([de65bce](https://github.com/podium-lib/proxy/commit/de65bce0020b6ad55bfc49f21912ed2891207039))
* **deps:** update dependency @podium/schemas to v4.1.14 ([0e38d44](https://github.com/podium-lib/proxy/commit/0e38d443c6c0a19c76a0ae9cf0df1de6e4350392))
* **deps:** update dependency @podium/schemas to v4.1.15 ([8331469](https://github.com/podium-lib/proxy/commit/833146915644f03a88cbcc96a385946cd6870d8b))
* **deps:** update dependency @podium/schemas to v4.1.16 ([585081e](https://github.com/podium-lib/proxy/commit/585081ec91e3bf7cc46cfeade68dfe57ae147a36))
* **deps:** update dependency @podium/schemas to v4.1.2 ([2f5c969](https://github.com/podium-lib/proxy/commit/2f5c96995e49aa593ecf7488ca844e741b3a6175))
* **deps:** update dependency @podium/schemas to v4.1.3 ([a2aa932](https://github.com/podium-lib/proxy/commit/a2aa93221cefa5cc50398cae828e03ce0bec2695))
* **deps:** update dependency @podium/schemas to v4.1.4 ([0f7e994](https://github.com/podium-lib/proxy/commit/0f7e9949030a5099f35674d05258fa36e7c0d3c9))
* **deps:** update dependency @podium/schemas to v4.1.5 ([ddfac03](https://github.com/podium-lib/proxy/commit/ddfac0336dab6683bb1ca9066e603ddc1657d9da))
* **deps:** update dependency @podium/schemas to v4.1.6 ([0da405a](https://github.com/podium-lib/proxy/commit/0da405af2ca82d6bcb2e0da7397a5967bdce8cdb))
* **deps:** update dependency @podium/schemas to v4.1.7 ([027450f](https://github.com/podium-lib/proxy/commit/027450f6d468956abf9b50373c1559f66b3b9fb9))
* **deps:** update dependency @podium/schemas to v4.1.8 ([40cd206](https://github.com/podium-lib/proxy/commit/40cd206630c46e4a718d27953e512c91e63ddb0c))
* **deps:** update dependency @podium/utils to v4.3.1 ([8a3e4b1](https://github.com/podium-lib/proxy/commit/8a3e4b10c9decd240b852e96db0d5a3aaf98c074))
* **deps:** update dependency @podium/utils to v4.3.3 ([36b3755](https://github.com/podium-lib/proxy/commit/36b37557365e4121da2661f3398066d55e5b98d2))
* **deps:** update dependency @podium/utils to v4.4.0 ([f245bcc](https://github.com/podium-lib/proxy/commit/f245bcc44df394584759760f52191d7c00d7f65c))
* **deps:** update dependency @podium/utils to v4.4.1 ([896e27d](https://github.com/podium-lib/proxy/commit/896e27d069725502832bacf081d552bff26ea9f2))
* **deps:** update dependency @podium/utils to v4.4.10 ([7198ad0](https://github.com/podium-lib/proxy/commit/7198ad0dcb026e1af19bf35a64508e9e086fbfd7))
* **deps:** update dependency @podium/utils to v4.4.11 ([5766099](https://github.com/podium-lib/proxy/commit/5766099fe0be264768c862a0e259c311fdaebda1))
* **deps:** update dependency @podium/utils to v4.4.13 ([d8d6f5d](https://github.com/podium-lib/proxy/commit/d8d6f5defbadcd6e0a450f2487db17daf6469776))
* **deps:** update dependency @podium/utils to v4.4.15 ([316ea8e](https://github.com/podium-lib/proxy/commit/316ea8e6d21fa1e7d2a625afa5ef03b7940365ea))
* **deps:** update dependency @podium/utils to v4.4.16 ([7a18be1](https://github.com/podium-lib/proxy/commit/7a18be16e4d803ef6ccd21981df5b2bf2256ab59))
* **deps:** update dependency @podium/utils to v4.4.17 ([92b90b6](https://github.com/podium-lib/proxy/commit/92b90b69966ec7116ad6ce7a1b54fde02380cc03))
* Update @podium/schema to version 4.1.9 to fix ajv error ([#134](https://github.com/podium-lib/proxy/issues/134)) ([ed5c5c7](https://github.com/podium-lib/proxy/commit/ed5c5c737a88ce1425988da9df6e152c48e84474))
* **deps:** update dependency @podium/utils to v4.4.2 ([ffb3cea](https://github.com/podium-lib/proxy/commit/ffb3cea6701bc870cfee894cc0b1e5fcdd1670e0))
* **deps:** update dependency @podium/utils to v4.4.3 ([bde55ee](https://github.com/podium-lib/proxy/commit/bde55ee6d3c8d05c64ca6e6cc60fe0cc8bb9345d))
* **deps:** update dependency @podium/utils to v4.4.4 ([53babc1](https://github.com/podium-lib/proxy/commit/53babc155fda975566237ac76bc8263743c5e58b))
* **deps:** update dependency @podium/utils to v4.4.5 ([d259631](https://github.com/podium-lib/proxy/commit/d259631d9f93011d863bfa28dfc269044898e702))
* **deps:** update dependency @podium/utils to v4.4.6 ([10078cc](https://github.com/podium-lib/proxy/commit/10078cc6144d26d258001e613b3a0ed79bd9a07a))
* **deps:** update dependency @podium/utils to v4.4.7 ([c126767](https://github.com/podium-lib/proxy/commit/c1267675bbd0cf7d5bfd154cbfda3b9be79068e3))
* **deps:** update dependency @podium/utils to v4.4.8 ([239b995](https://github.com/podium-lib/proxy/commit/239b995bc194b12488fbd7ddb3598b27041dad2c))
* **deps:** update dependency @podium/utils to v4.4.9 ([789614e](https://github.com/podium-lib/proxy/commit/789614ee102969dbfb74c63a23fd88ffe6472f00))
* **deps:** update dependency path-to-regexp to v6.2.0 ([b47db02](https://github.com/podium-lib/proxy/commit/b47db02fb7ba35fbf71cb46f37b5731f7a2c052d))


### Features

* Convert to ESM ([#150](https://github.com/podium-lib/proxy/issues/150)) ([9f3c2d3](https://github.com/podium-lib/proxy/commit/9f3c2d3e3474889b73706f4e1cf5d571ed2a42ee))


### BREAKING CHANGES

* Convert from CommonJS to ESM

* feat: Convert to ESM

Co-authored-by: Trygve Lie <trygve.lie@finn.no>

# [5.0.0-next.4](https://github.com/podium-lib/proxy/compare/v5.0.0-next.3...v5.0.0-next.4) (2020-07-29)


### Features

* Use ES private properties instead of Symbols and defineProperty() for privacy ([#84](https://github.com/podium-lib/proxy/issues/84)) ([37fd140](https://github.com/podium-lib/proxy/commit/37fd1406975a046e0f79b50858c04bd13ca46ba0))


### BREAKING CHANGES

* Due to dropping node 10.x support we use ES private properties instead of Symbols and `.defineProperty()`.

Co-authored-by: Trygve Lie <trygve.lie@finn.no>

# [5.0.0-next.3](https://github.com/podium-lib/proxy/compare/v5.0.0-next.2...v5.0.0-next.3) (2020-07-15)
* **deps:** update dependency path-to-regexp to v6.2.1 ([9dcda20](https://github.com/podium-lib/proxy/commit/9dcda204a18cf86ff487dacb8da94b909ba7ad9c))

## [4.2.74](https://github.com/podium-lib/proxy/compare/v4.2.73...v4.2.74) (2022-04-05)


### Bug Fixes

* remove trailer header if present when proxying ([9698a40](https://github.com/podium-lib/proxy/commit/9698a40df081217ce142d4de71f929baaa339cdf))

## [4.2.73](https://github.com/podium-lib/proxy/compare/v4.2.72...v4.2.73) (2022-03-23)


### Bug Fixes

* **deps:** update podium packages ([a2fd327](https://github.com/podium-lib/proxy/commit/a2fd327896bbfe282f311ab3363008c395caefbd))

## [4.2.72](https://github.com/podium-lib/proxy/compare/v4.2.71...v4.2.72) (2022-02-05)


### Bug Fixes

* **deps:** update dependency @podium/utils to v4.4.35 ([ec7b5a5](https://github.com/podium-lib/proxy/commit/ec7b5a5dfcd57a0e03f96f49c123c87a68e5d03e))

## [4.2.71](https://github.com/podium-lib/proxy/compare/v4.2.70...v4.2.71) (2022-02-05)


### Bug Fixes

* **deps:** update dependency @podium/schemas to v4.1.31 ([ceec640](https://github.com/podium-lib/proxy/commit/ceec6402c540e9d28afa1ccfa8f265a74c0e768f))

## [4.2.70](https://github.com/podium-lib/proxy/compare/v4.2.69...v4.2.70) (2022-01-15)


### Bug Fixes

* **deps:** update dependency @podium/utils to v4.4.34 ([619729e](https://github.com/podium-lib/proxy/commit/619729e83a243f8477a386bd3d1629bf901bfbc4))

## [4.2.69](https://github.com/podium-lib/proxy/compare/v4.2.68...v4.2.69) (2022-01-15)


### Bug Fixes

* **deps:** update dependency @podium/schemas to v4.1.30 ([9b9762f](https://github.com/podium-lib/proxy/commit/9b9762fad68e1128b70ab16717f537c0c8a63389))

## [4.2.68](https://github.com/podium-lib/proxy/compare/v4.2.67...v4.2.68) (2022-01-02)


### Bug Fixes

* **deps:** update dependency @podium/utils to v4.4.33 ([5694777](https://github.com/podium-lib/proxy/commit/5694777fc25663560b1b0cc4a3ac51c391d96139))

## [4.2.67](https://github.com/podium-lib/proxy/compare/v4.2.66...v4.2.67) (2021-11-22)


### Bug Fixes

* **deps:** update dependency @podium/utils to v4.4.32 ([34f3e3d](https://github.com/podium-lib/proxy/commit/34f3e3d15cc67935a0b6e4621c5dc46eb825bf55))

## [4.2.66](https://github.com/podium-lib/proxy/compare/v4.2.65...v4.2.66) (2021-11-22)


### Bug Fixes

* **deps:** update dependency @podium/schemas to v4.1.29 ([8b3aa2e](https://github.com/podium-lib/proxy/commit/8b3aa2ea18c002c245637a987d1c1d482f9f4478))

## [4.2.65](https://github.com/podium-lib/proxy/compare/v4.2.64...v4.2.65) (2021-11-17)


### Bug Fixes

* **deps:** update dependency @podium/utils to v4.4.31 ([96cd22c](https://github.com/podium-lib/proxy/commit/96cd22c7569858c951feebba8d4b1541b1ec8e28))

## [4.2.64](https://github.com/podium-lib/proxy/compare/v4.2.63...v4.2.64) (2021-11-17)


### Bug Fixes

* **deps:** update dependency @podium/schemas to v4.1.28 ([18122b5](https://github.com/podium-lib/proxy/commit/18122b56fc8adb08ac9213657389f5358469fabf))

## [4.2.63](https://github.com/podium-lib/proxy/compare/v4.2.62...v4.2.63) (2021-11-15)


### Bug Fixes

* **deps:** update dependency @podium/utils to v4.4.30 ([1da6d7b](https://github.com/podium-lib/proxy/commit/1da6d7b72d2cbb6d7bdfcba5d4b5e2611e5221b4))

## [4.2.62](https://github.com/podium-lib/proxy/compare/v4.2.61...v4.2.62) (2021-11-14)


### Bug Fixes

* **deps:** update dependency @podium/utils to v4.4.29 ([5274f30](https://github.com/podium-lib/proxy/commit/5274f30b2750add105fcba232674a05a11fb1178))

## [4.2.61](https://github.com/podium-lib/proxy/compare/v4.2.60...v4.2.61) (2021-11-14)


### Bug Fixes

* **deps:** update dependency @podium/schemas to v4.1.27 ([83fcf95](https://github.com/podium-lib/proxy/commit/83fcf95e4c765cac52e4ab835694f23f504400cf))

## [4.2.60](https://github.com/podium-lib/proxy/compare/v4.2.59...v4.2.60) (2021-11-09)


### Bug Fixes

* **deps:** update dependency @podium/utils to v4.4.28 ([7da28db](https://github.com/podium-lib/proxy/commit/7da28db288e727e38a758e40c8294d08aca9b2ab))

## [4.2.59](https://github.com/podium-lib/proxy/compare/v4.2.58...v4.2.59) (2021-11-09)


### Bug Fixes

* **deps:** update dependency @podium/schemas to v4.1.26 ([78a68b6](https://github.com/podium-lib/proxy/commit/78a68b6f5cec3b1fa70dbe8393115ea5c29adc32))

## [4.2.58](https://github.com/podium-lib/proxy/compare/v4.2.57...v4.2.58) (2021-10-27)


### Bug Fixes

* **deps:** update dependency @podium/utils to v4.4.27 ([#180](https://github.com/podium-lib/proxy/issues/180)) ([a99b27a](https://github.com/podium-lib/proxy/commit/a99b27ae4ed9a5c3db8da72d982129051ef0a418))

## [4.2.57](https://github.com/podium-lib/proxy/compare/v4.2.56...v4.2.57) (2021-09-13)


### Bug Fixes

* **deps:** update dependency @podium/utils to v4.4.26 ([1867065](https://github.com/podium-lib/proxy/commit/18670658852f1d9489f692ea46787d21b4edd781))

## [4.2.56](https://github.com/podium-lib/proxy/compare/v4.2.55...v4.2.56) (2021-09-13)


### Bug Fixes

* **deps:** update dependency @podium/schemas to v4.1.25 ([4bd3d10](https://github.com/podium-lib/proxy/commit/4bd3d10b37d6ef8d8758f679db1353ea3fc2a91d))

## [4.2.55](https://github.com/podium-lib/proxy/compare/v4.2.54...v4.2.55) (2021-08-14)


### Bug Fixes

* **deps:** update dependency @podium/utils to v4.4.25 ([e8be328](https://github.com/podium-lib/proxy/commit/e8be328175a6d5012c5727bc6466eb920aaf65b0))

## [4.2.54](https://github.com/podium-lib/proxy/compare/v4.2.53...v4.2.54) (2021-08-14)


### Bug Fixes

* **deps:** update dependency @podium/schemas to v4.1.24 ([b6a58e2](https://github.com/podium-lib/proxy/commit/b6a58e2694cae80de2aed1a23b895ec467253614))

## [4.2.53](https://github.com/podium-lib/proxy/compare/v4.2.52...v4.2.53) (2021-07-16)


### Bug Fixes

* **deps:** update dependency @podium/utils to v4.4.24 ([ee30140](https://github.com/podium-lib/proxy/commit/ee30140395eae61ab8d0ca486fa77cf66cc73040))

## [4.2.52](https://github.com/podium-lib/proxy/compare/v4.2.51...v4.2.52) (2021-07-15)


### Bug Fixes

* **deps:** update dependency @podium/schemas to v4.1.23 ([3c1402d](https://github.com/podium-lib/proxy/commit/3c1402de376e437776c326edef1f7a4ae54c703d))

## [4.2.51](https://github.com/podium-lib/proxy/compare/v4.2.50...v4.2.51) (2021-07-04)


### Bug Fixes

* **deps:** update dependency @podium/utils to v4.4.23 ([d10d26c](https://github.com/podium-lib/proxy/commit/d10d26c8a0f92926eb2846d4c20f3ed8f93ef0e9))

## [4.2.50](https://github.com/podium-lib/proxy/compare/v4.2.49...v4.2.50) (2021-07-04)


### Bug Fixes

* **deps:** update dependency @podium/schemas to v4.1.22 ([512d8cc](https://github.com/podium-lib/proxy/commit/512d8cc37a3780ecee3820e29a734948010c8759))

## [4.2.49](https://github.com/podium-lib/proxy/compare/v4.2.48...v4.2.49) (2021-06-06)


### Bug Fixes

* **deps:** update dependency @podium/utils to v4.4.22 ([3a1893a](https://github.com/podium-lib/proxy/commit/3a1893af3fb8ae7dd527cf818eed60d7d41cdcd4))

## [4.2.48](https://github.com/podium-lib/proxy/compare/v4.2.47...v4.2.48) (2021-06-06)


### Bug Fixes

* **deps:** update dependency @podium/schemas to v4.1.21 ([1f38ae1](https://github.com/podium-lib/proxy/commit/1f38ae1cfe9588ae1a8c15eea75ff8b03012c15c))

## [4.2.47](https://github.com/podium-lib/proxy/compare/v4.2.46...v4.2.47) (2021-05-24)


### Bug Fixes

* **deps:** update dependency @podium/utils to v4.4.21 ([18e3764](https://github.com/podium-lib/proxy/commit/18e3764d133e07fa60be3e16977b9f4b88f33f3a))

## [4.2.46](https://github.com/podium-lib/proxy/compare/v4.2.45...v4.2.46) (2021-05-24)


### Bug Fixes

* **deps:** update dependency @podium/schemas to v4.1.20 ([102f457](https://github.com/podium-lib/proxy/commit/102f457836ef12d633d82f5eb783d67824f91cd3))

## [4.2.45](https://github.com/podium-lib/proxy/compare/v4.2.44...v4.2.45) (2021-05-15)


### Bug Fixes

* **deps:** update dependency @podium/utils to v4.4.20 ([f795a85](https://github.com/podium-lib/proxy/commit/f795a857b77624b328f8127f39dc36061b724bec))

## [4.2.44](https://github.com/podium-lib/proxy/compare/v4.2.43...v4.2.44) (2021-05-14)


### Bug Fixes

* **deps:** update dependency @podium/schemas to v4.1.19 ([6f197e7](https://github.com/podium-lib/proxy/commit/6f197e796c39ea11b89002f4957b478d492bd458))

## [4.2.43](https://github.com/podium-lib/proxy/compare/v4.2.42...v4.2.43) (2021-05-09)


### Bug Fixes

* **deps:** update dependency @podium/utils to v4.4.19 ([7401099](https://github.com/podium-lib/proxy/commit/7401099d7f547b1fa85d31111c8832587d27ac93))

## [4.2.42](https://github.com/podium-lib/proxy/compare/v4.2.41...v4.2.42) (2021-05-09)


### Bug Fixes

* **deps:** update dependency @podium/schemas to v4.1.18 ([99cdf06](https://github.com/podium-lib/proxy/commit/99cdf0630e6b3d21db890a7b780d76777b054ac0))

## [4.2.41](https://github.com/podium-lib/proxy/compare/v4.2.40...v4.2.41) (2021-05-05)


### Bug Fixes

* **deps:** update dependency @podium/utils to v4.4.18 ([bfe44f2](https://github.com/podium-lib/proxy/commit/bfe44f21df74fcae60f2bda46bc2e3b58352c498))

## [4.2.40](https://github.com/podium-lib/proxy/compare/v4.2.39...v4.2.40) (2021-05-05)


### Bug Fixes

* **deps:** update dependency @podium/schemas to v4.1.17 ([5295541](https://github.com/podium-lib/proxy/commit/529554128a2edc430a5b1af7a449f8164d779563))

## [4.2.39](https://github.com/podium-lib/proxy/compare/v4.2.38...v4.2.39) (2021-04-27)


### Bug Fixes

* **deps:** update dependency @podium/utils to v4.4.17 ([92b90b6](https://github.com/podium-lib/proxy/commit/92b90b69966ec7116ad6ce7a1b54fde02380cc03))

## [4.2.38](https://github.com/podium-lib/proxy/compare/v4.2.37...v4.2.38) (2021-04-27)


### Bug Fixes

* **deps:** update dependency @podium/schemas to v4.1.16 ([585081e](https://github.com/podium-lib/proxy/commit/585081ec91e3bf7cc46cfeade68dfe57ae147a36))

## [4.2.37](https://github.com/podium-lib/proxy/compare/v4.2.36...v4.2.37) (2021-04-11)


### Bug Fixes

* **deps:** update dependency @podium/utils to v4.4.16 ([7a18be1](https://github.com/podium-lib/proxy/commit/7a18be16e4d803ef6ccd21981df5b2bf2256ab59))

## [4.2.36](https://github.com/podium-lib/proxy/compare/v4.2.35...v4.2.36) (2021-04-11)


### Bug Fixes

* **deps:** update dependency @podium/schemas to v4.1.15 ([8331469](https://github.com/podium-lib/proxy/commit/833146915644f03a88cbcc96a385946cd6870d8b))

## [4.2.35](https://github.com/podium-lib/proxy/compare/v4.2.34...v4.2.35) (2021-04-02)


### Bug Fixes

* **deps:** update dependency @podium/utils to v4.4.15 ([316ea8e](https://github.com/podium-lib/proxy/commit/316ea8e6d21fa1e7d2a625afa5ef03b7940365ea))

## [4.2.34](https://github.com/podium-lib/proxy/compare/v4.2.33...v4.2.34) (2021-04-02)


### Bug Fixes

* **deps:** update dependency @podium/schemas to v4.1.14 ([0e38d44](https://github.com/podium-lib/proxy/commit/0e38d443c6c0a19c76a0ae9cf0df1de6e4350392))

## [4.2.33](https://github.com/podium-lib/proxy/compare/v4.2.32...v4.2.33) (2021-04-02)


### Bug Fixes

* **deps:** update dependency @podium/schemas to v4.1.13 ([de65bce](https://github.com/podium-lib/proxy/commit/de65bce0020b6ad55bfc49f21912ed2891207039))

## [4.2.32](https://github.com/podium-lib/proxy/compare/v4.2.31...v4.2.32) (2021-04-01)


### Bug Fixes

* **deps:** update dependency @podium/utils to v4.4.13 ([d8d6f5d](https://github.com/podium-lib/proxy/commit/d8d6f5defbadcd6e0a450f2487db17daf6469776))

## [4.2.31](https://github.com/podium-lib/proxy/compare/v4.2.30...v4.2.31) (2021-04-01)


### Bug Fixes

* **deps:** update dependency @podium/schemas to v4.1.11 ([8687e5d](https://github.com/podium-lib/proxy/commit/8687e5d1921b2d147626c1710ab92eb090e9142a))

## [4.2.30](https://github.com/podium-lib/proxy/compare/v4.2.29...v4.2.30) (2021-03-31)


### Bug Fixes

* **deps:** update dependency @podium/schemas to v4.1.10 ([6f58fa8](https://github.com/podium-lib/proxy/commit/6f58fa8eb2c4aeb8b80b6e18affe5c3210bcfd63))

## [4.2.29](https://github.com/podium-lib/proxy/compare/v4.2.28...v4.2.29) (2021-03-30)


### Bug Fixes

* Use v5 versions of @podium/utils and @podium/schema ([a37ca1f](https://github.com/podium-lib/proxy/commit/a37ca1f151e7e334856b5fb09e5dfe122724280b))

# [5.0.0-next.2](https://github.com/podium-lib/proxy/compare/v5.0.0-next.1...v5.0.0-next.2) (2020-07-13)
* Update @podium/schema to version 4.1.9 to fix ajv error ([#134](https://github.com/podium-lib/proxy/issues/134)) ([ed5c5c7](https://github.com/podium-lib/proxy/commit/ed5c5c737a88ce1425988da9df6e152c48e84474))

## [4.2.28](https://github.com/podium-lib/proxy/compare/v4.2.27...v4.2.28) (2021-03-27)


### Bug Fixes

* Update @podium/utils to version 5.0.0-next.1 ([29da2c9](https://github.com/podium-lib/proxy/commit/29da2c9da76f35a772eb5e8ed874b660bf99186e))

# [5.0.0-next.1](https://github.com/podium-lib/proxy/compare/v4.2.1...v5.0.0-next.1) (2020-07-13)


### Features

* Drop node 10.x support ([bcd95a1](https://github.com/podium-lib/proxy/commit/bcd95a144d54861fa7d7e28c0298a87463902bc1))


### BREAKING CHANGES

* Only support node 12 and 14.
* **deps:** update dependency @podium/utils to v4.4.11 ([5766099](https://github.com/podium-lib/proxy/commit/5766099fe0be264768c862a0e259c311fdaebda1))

## [4.2.27](https://github.com/podium-lib/proxy/compare/v4.2.26...v4.2.27) (2021-03-27)


### Bug Fixes

* **deps:** update dependency @podium/schemas to v4.1.8 ([40cd206](https://github.com/podium-lib/proxy/commit/40cd206630c46e4a718d27953e512c91e63ddb0c))

## [4.2.26](https://github.com/podium-lib/proxy/compare/v4.2.25...v4.2.26) (2021-03-26)


### Bug Fixes

* **deps:** update dependency @podium/utils to v4.4.10 ([7198ad0](https://github.com/podium-lib/proxy/commit/7198ad0dcb026e1af19bf35a64508e9e086fbfd7))

## [4.2.25](https://github.com/podium-lib/proxy/compare/v4.2.24...v4.2.25) (2021-03-26)


### Bug Fixes

* **deps:** update dependency @podium/schemas to v4.1.7 ([027450f](https://github.com/podium-lib/proxy/commit/027450f6d468956abf9b50373c1559f66b3b9fb9))

## [4.2.24](https://github.com/podium-lib/proxy/compare/v4.2.23...v4.2.24) (2021-03-20)


### Bug Fixes

* **deps:** update dependency @podium/utils to v4.4.9 ([789614e](https://github.com/podium-lib/proxy/commit/789614ee102969dbfb74c63a23fd88ffe6472f00))

## [4.2.23](https://github.com/podium-lib/proxy/compare/v4.2.22...v4.2.23) (2021-03-20)


### Bug Fixes

* **deps:** update dependency @podium/schemas to v4.1.6 ([0da405a](https://github.com/podium-lib/proxy/commit/0da405af2ca82d6bcb2e0da7397a5967bdce8cdb))

## [4.2.22](https://github.com/podium-lib/proxy/compare/v4.2.21...v4.2.22) (2021-03-08)


### Bug Fixes

* **deps:** update dependency @podium/utils to v4.4.8 ([239b995](https://github.com/podium-lib/proxy/commit/239b995bc194b12488fbd7ddb3598b27041dad2c))

## [4.2.21](https://github.com/podium-lib/proxy/compare/v4.2.20...v4.2.21) (2021-03-08)


### Bug Fixes

* **deps:** update dependency @podium/schemas to v4.1.5 ([ddfac03](https://github.com/podium-lib/proxy/commit/ddfac0336dab6683bb1ca9066e603ddc1657d9da))

## [4.2.20](https://github.com/podium-lib/proxy/compare/v4.2.19...v4.2.20) (2021-03-07)


### Bug Fixes

* **deps:** update dependency @podium/utils to v4.4.7 ([c126767](https://github.com/podium-lib/proxy/commit/c1267675bbd0cf7d5bfd154cbfda3b9be79068e3))

## [4.2.19](https://github.com/podium-lib/proxy/compare/v4.2.18...v4.2.19) (2021-03-07)


### Bug Fixes

* **deps:** update dependency @podium/schemas to v4.1.4 ([0f7e994](https://github.com/podium-lib/proxy/commit/0f7e9949030a5099f35674d05258fa36e7c0d3c9))

## [4.2.18](https://github.com/podium-lib/proxy/compare/v4.2.17...v4.2.18) (2021-02-17)


### Bug Fixes

* **deps:** update dependency @podium/utils to v4.4.6 ([10078cc](https://github.com/podium-lib/proxy/commit/10078cc6144d26d258001e613b3a0ed79bd9a07a))

## [4.2.17](https://github.com/podium-lib/proxy/compare/v4.2.16...v4.2.17) (2021-02-17)


### Bug Fixes

* **deps:** update dependency @podium/schemas to v4.1.3 ([a2aa932](https://github.com/podium-lib/proxy/commit/a2aa93221cefa5cc50398cae828e03ce0bec2695))

## [4.2.16](https://github.com/podium-lib/proxy/compare/v4.2.15...v4.2.16) (2021-02-11)


### Bug Fixes

* **deps:** update dependency @podium/utils to v4.4.5 ([d259631](https://github.com/podium-lib/proxy/commit/d259631d9f93011d863bfa28dfc269044898e702))

## [4.2.15](https://github.com/podium-lib/proxy/compare/v4.2.14...v4.2.15) (2021-02-11)


### Bug Fixes

* **deps:** update dependency @podium/schemas to v4.1.2 ([2f5c969](https://github.com/podium-lib/proxy/commit/2f5c96995e49aa593ecf7488ca844e741b3a6175))

## [4.2.14](https://github.com/podium-lib/proxy/compare/v4.2.13...v4.2.14) (2021-02-02)


### Bug Fixes

* **deps:** update dependency @podium/utils to v4.4.4 ([53babc1](https://github.com/podium-lib/proxy/commit/53babc155fda975566237ac76bc8263743c5e58b))

## [4.2.13](https://github.com/podium-lib/proxy/compare/v4.2.12...v4.2.13) (2021-02-01)


### Bug Fixes

* **deps:** update dependency @podium/schemas to v4.1.1 ([6ba8a0c](https://github.com/podium-lib/proxy/commit/6ba8a0c4797593f8870505f9ea01c60e710cb89c))

## [4.2.12](https://github.com/podium-lib/proxy/compare/v4.2.11...v4.2.12) (2021-01-22)


### Bug Fixes

* **deps:** update dependency @podium/utils to v4.4.3 ([bde55ee](https://github.com/podium-lib/proxy/commit/bde55ee6d3c8d05c64ca6e6cc60fe0cc8bb9345d))

## [4.2.11](https://github.com/podium-lib/proxy/compare/v4.2.10...v4.2.11) (2021-01-22)


### Bug Fixes

* **deps:** update dependency @podium/schemas to v4.1.0 ([6c6aa2d](https://github.com/podium-lib/proxy/commit/6c6aa2d1a56910702529fd167a1f44ad57f259e8))

## [4.2.10](https://github.com/podium-lib/proxy/compare/v4.2.9...v4.2.10) (2021-01-21)


### Bug Fixes

* **deps:** update dependency @podium/utils to v4.4.2 ([ffb3cea](https://github.com/podium-lib/proxy/commit/ffb3cea6701bc870cfee894cc0b1e5fcdd1670e0))

## [4.2.9](https://github.com/podium-lib/proxy/compare/v4.2.8...v4.2.9) (2021-01-21)


### Bug Fixes

* **deps:** update dependency @podium/schemas to v4.0.7 ([f6bb236](https://github.com/podium-lib/proxy/commit/f6bb236a759be3fda16b524c4f5bb514aad5014c))

## [4.2.8](https://github.com/podium-lib/proxy/compare/v4.2.7...v4.2.8) (2020-10-29)


### Bug Fixes

* **deps:** update dependency @podium/utils to v4.4.1 ([896e27d](https://github.com/podium-lib/proxy/commit/896e27d069725502832bacf081d552bff26ea9f2))

## [4.2.7](https://github.com/podium-lib/proxy/compare/v4.2.6...v4.2.7) (2020-10-12)


### Bug Fixes

* **deps:** update dependency @podium/utils to v4.4.0 ([f245bcc](https://github.com/podium-lib/proxy/commit/f245bcc44df394584759760f52191d7c00d7f65c))

## [4.2.6](https://github.com/podium-lib/proxy/compare/v4.2.5...v4.2.6) (2020-10-10)


### Bug Fixes

* **deps:** update dependency @podium/utils to v4.3.3 ([36b3755](https://github.com/podium-lib/proxy/commit/36b37557365e4121da2661f3398066d55e5b98d2))

## [4.2.5](https://github.com/podium-lib/proxy/compare/v4.2.4...v4.2.5) (2020-10-10)


### Bug Fixes

* **deps:** update dependency @podium/schemas to v4.0.5 ([8a966c0](https://github.com/podium-lib/proxy/commit/8a966c006c61422ac1b5ebaf970c2a67da228bdf))

## [4.2.4](https://github.com/podium-lib/proxy/compare/v4.2.3...v4.2.4) (2020-09-29)


### Bug Fixes

* **deps:** update dependency path-to-regexp to v6.2.0 ([b47db02](https://github.com/podium-lib/proxy/commit/b47db02fb7ba35fbf71cb46f37b5731f7a2c052d))

## [4.2.3](https://github.com/podium-lib/proxy/compare/v4.2.2...v4.2.3) (2020-09-13)


### Bug Fixes

* **deps:** update dependency @podium/utils to v4.3.1 ([8a3e4b1](https://github.com/podium-lib/proxy/commit/8a3e4b10c9decd240b852e96db0d5a3aaf98c074))

## [4.2.2](https://github.com/podium-lib/proxy/compare/v4.2.1...v4.2.2) (2020-09-13)


### Bug Fixes

* **deps:** update dependency @podium/schemas to v4.0.4 ([9fdbee6](https://github.com/podium-lib/proxy/commit/9fdbee6657ce48af72ddbb1987ea8af6340b2164))

# Changelog

Notable changes to this project.

The latest version of this document is always available in [releases][releases-url].

## [Unreleased]


## [3.0.4] - 2019-03-27

-   Updated @podium/utils to version 3.1.2 - [#14](https://github.com/podium-lib/proxy/pull/14)
-   Updated other dependencies

## [3.0.3] - 2019-03-11

-   Listen for error events on the internal cache - [#13](https://github.com/podium-lib/proxy/pull/13)

## [3.0.2] - 2019-03-10

-   Updated @metrics/client to version 2.4.1 - [#12](https://github.com/podium-lib/proxy/pull/12)

## [3.0.1] - 2019-03-05

-   Add error event listeners on all metric streams - [#10](https://github.com/podium-lib/proxy/pull/10)

## [3.0.0] - 2019-02-20

-   Initial open source release. Module is made http framework free and open source.

[unreleased]: https://github.com/podium-lib/proxy/compare/v3.0.4...HEAD
[3.0.4]: https://github.com/podium-lib/proxy/compare/v3.0.3...v3.0.4
[3.0.3]: https://github.com/podium-lib/proxy/compare/v3.0.2...v3.0.3
[3.0.2]: https://github.com/podium-lib/proxy/compare/v3.0.1...v3.0.2
[3.0.1]: https://github.com/podium-lib/proxy/compare/v3.0.0...v3.0.1
[3.0.0]: https://github.com/podium-lib/proxy/releases/tag/v3.0.0
[releases-url]: https://github.com/podium-lib/proxy/blob/master/CHANGELOG.md
