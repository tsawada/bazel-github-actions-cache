# bazel-github-actions-cache

bazel-github-actions-cache is a Bazel Remote Caching server that uses Github Action's undocumented cache API as backend.

Its goal is to utilize Actions Cache more efficiently, both in terms of speed and space, compared to [actions/cache](https://github.com/actions/cache).

## TODO

* Proper error handling
* Compression
* gRPC interface
