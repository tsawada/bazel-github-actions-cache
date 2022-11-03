# bazel-github-actions-cache

bazel-github-actions-cache is a Bazel Remote Caching server that uses Github Action's undocumented cache API as backend.

Its goal is to utilize Actions Cache more efficiently, both in terms of speed and space, compared to [actions/cache](https://github.com/actions/cache).

## Usage

Add following step in your actions yaml file.
```
    - name: bazel-github-actions-cache
      uses: tsawada/bazel-github-actions-cache@v0
```

Add following flag to Bazel.
```
--remote_cache=http://localhost:3055
```

## TODO

* Proper error handling
* Compression
* gRPC interface
