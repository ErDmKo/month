# WhatAmonth

Simple phoenix month app

## Run for develop

```bash
mix phx.server
```

Server will be runned on http://localhost:4000

## Deploy command sequence

```bash
ssh-add
git add lib
git commit -a
git push
ansible-playbook ansible/pull.yaml -i ansible/inventory.yaml
```

## Bazel static build

### Pretter

Run this command to fix code style

```bash
bazel run //assets/js:prettier
```

### Build static

```bash
bazel build //assets/js:closure
bazel build //assets/css
```

### Run rust server

```bash
bazel run //server:server
```

#### Run code formater
```bash
cargo fmt
```

This command will run a http server on port 8080

### Run npm comands in bazel

```bash
 bazel run @nodejs_host//:npm -- version
```

### Run cargo-raze

```bash
bazel run @cargo_raze//:raze -- --manifest-path=$(realpath /Cargo.toml)
```
