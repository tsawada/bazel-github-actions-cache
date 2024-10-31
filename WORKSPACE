workspace(name = "com_github_tsawada_bazel_github_actions_cache")

load("@bazel_tools//tools/build_defs/repo:http.bzl", "http_archive")

http_archive(
    name = "aspect_rules_ts",
    sha256 = "97a8246bf6d1c7077b296e90a6e307bf8eabed02c5bca84d46db81efbf6ead41",
    strip_prefix = "rules_ts-2.4.0",
    url = "https://github.com/aspect-build/rules_ts/releases/download/v2.4.0/rules_ts-v2.4.0.tar.gz",
)

load("@aspect_rules_ts//ts:repositories.bzl", "rules_ts_dependencies")

rules_ts_dependencies(ts_version_from = "//:package.json")

load("@aspect_rules_js//js:repositories.bzl", "rules_js_dependencies")

rules_js_dependencies()

load("@bazel_features//:deps.bzl", "bazel_features_deps")

bazel_features_deps()

load("@rules_nodejs//nodejs:repositories.bzl", "nodejs_register_toolchains")

nodejs_register_toolchains(
    name = "node16",
    node_version = "16.16.0",
)

load("@aspect_rules_js//npm:npm_import.bzl", "npm_translate_lock")

npm_translate_lock(
    name = "npm",
    pnpm_lock = "//:pnpm-lock.yaml",
    verify_node_modules_ignored = "//:.bazelignore",
)

load("@npm//:repositories.bzl", "npm_repositories")

npm_repositories()

http_archive(
    name = "aspect_rules_esbuild",
    sha256 = "1e365451341ffb2490193292dfd9953f2ca009586c2381cb4dc08d01e48866b7",
    strip_prefix = "rules_esbuild-0.12.0",
    url = "https://github.com/aspect-build/rules_esbuild/archive/refs/tags/v0.12.0.tar.gz",
)

load("@aspect_rules_esbuild//esbuild:dependencies.bzl", "rules_esbuild_dependencies")

rules_esbuild_dependencies()

load("@aspect_rules_esbuild//esbuild:repositories.bzl", "LATEST_VERSION", "esbuild_register_toolchains")

esbuild_register_toolchains(
    name = "esbuild",
    esbuild_version = LATEST_VERSION,
)
