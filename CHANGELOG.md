## [1.1.0](https://github.com/umweltkulturverein/menschis/compare/v1.0.0...v1.1.0) (2026-05-22)

### Features

* add email verification ([be7ea4e](https://github.com/umweltkulturverein/menschis/commit/be7ea4ead76c0f18d0048ba23b258e37bc5a469f))
* **front-end:** edit shift form ([53e67c8](https://github.com/umweltkulturverein/menschis/commit/53e67c8929ecced2fe80d6ae28089906a645d45e))
* **front-end:** edit shift form ([d7a9645](https://github.com/umweltkulturverein/menschis/commit/d7a96452a53fc3238fa735b205f9288401339687))
* **shifts:** integrate Pretix ticket lifecycle with shift entries ([6e22966](https://github.com/umweltkulturverein/menschis/commit/6e22966de7cb4ae5f3b3da3e241257fc3923266f))
* smtp connector and email template, add cancel orders, implement lazy resp code check, add status validation of order ([ee820ab](https://github.com/umweltkulturverein/menschis/commit/ee820ab0587d3396fcbf9665bb90b48e1850cb67))

### Bug Fixes

* add kysely ([71befb6](https://github.com/umweltkulturverein/menschis/commit/71befb6e26955d62c4cb2fea2e9244a1c2fe8dcd))
* add kysely ([20d871d](https://github.com/umweltkulturverein/menschis/commit/20d871d3a5d3ea5586174edf94d40f46e00506b7))
* build ([fb32f54](https://github.com/umweltkulturverein/menschis/commit/fb32f54333cd200189074dcc74c97a6106f1618c))
* cancel orders, implement lazy resp code check, add status validation of order ([7875c4a](https://github.com/umweltkulturverein/menschis/commit/7875c4aa1aa724af52e7ec82b2dbe31689c82f96))
* change internal validation ([88e6e13](https://github.com/umweltkulturverein/menschis/commit/88e6e133a43ec17b40ac972ba1bf7342f969ac07))
* improve feedback to user ([0ca8e62](https://github.com/umweltkulturverein/menschis/commit/0ca8e623d7fcfefdb5f6151e2968ff15b3f55977))
* remove unused log statements ([6bbf70d](https://github.com/umweltkulturverein/menschis/commit/6bbf70d06783cbe20b27cf391ea9c531e6820e6a))

## 1.0.0 (2026-04-19)

### Features

* add auth and db interaction ([667caca](https://github.com/umweltkulturverein/menschis/commit/667caca568c38a2c711a950cba539eac5b78931c))
* add Natural DateTime Handler ([61e3fd9](https://github.com/umweltkulturverein/menschis/commit/61e3fd9c9bb4a3ff617eb997980c4a01489e1068))
* add shiftentry db structure ([4daedbd](https://github.com/umweltkulturverein/menschis/commit/4daedbd41ac0f4994226ab18628d0c67038861ac))
* add structure for api, components and models and sample endpoint ([2663efc](https://github.com/umweltkulturverein/menschis/commit/2663efc53d066a0e1d7b0993bc7d1f720065d32d))
* **authorized-shifts:** implement apply and validation endpoint ([f8ea702](https://github.com/umweltkulturverein/menschis/commit/f8ea702faf00f62f6851e2b8f285d6b75efc0015))
* fix build and add pipeline ([119fe6d](https://github.com/umweltkulturverein/menschis/commit/119fe6d27c4adab47930807bcfbdbabf37ad26b2))
* latest ref ([008ea5a](https://github.com/umweltkulturverein/menschis/commit/008ea5aaf69190776763f405a274e35b57a5d318))
* shift entry system with magic link auth and event days ([41980aa](https://github.com/umweltkulturverein/menschis/commit/41980aa6ff19db129636299064f2f46e5f901493))
* write signed-in users to db ([b45784e](https://github.com/umweltkulturverein/menschis/commit/b45784ef4cfb594e65fc58e077b592e554ed2efd))

### Bug Fixes

* add db url to dockerfile ([b11d71b](https://github.com/umweltkulturverein/menschis/commit/b11d71bb84b1da632f72df457eace9fbb54f937b))
* add release ([722435e](https://github.com/umweltkulturverein/menschis/commit/722435eb4952eff5cd3d86f7c839f1e48590df11))
* bun.lock ([09b49b6](https://github.com/umweltkulturverein/menschis/commit/09b49b6608d1658de4b7255ea72e05c22a2316bd))
* cascarding delete was a bad idea. Behaviour is not expected by a normal user. removing it ([a80f2fe](https://github.com/umweltkulturverein/menschis/commit/a80f2fe50e5fc36ee01d33ede6414ef5820e8020))
* ci and dockerfile ([2179943](https://github.com/umweltkulturverein/menschis/commit/217994325c1441ef84f2b0288c3254febc9a58b9))
* init kysely ([71da670](https://github.com/umweltkulturverein/menschis/commit/71da6703382e96786a1099bc37172b428d4d376d))
* re-run workflow ([e90328c](https://github.com/umweltkulturverein/menschis/commit/e90328c861840758f70b378a2b00e58474d4e22f))
* sso required for internal shifts ([e936f32](https://github.com/umweltkulturverein/menschis/commit/e936f32185f5d21b8ea8859d93072cccfcbb3686))
* validation if day can be deleted ([6aea69f](https://github.com/umweltkulturverein/menschis/commit/6aea69f7d1e45af800f7fa0ba56c9b422b0e8664))
