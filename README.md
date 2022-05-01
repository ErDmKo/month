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
bazel run //assets/src:prettier
```

### Build and copy static

```bash
bazel build //assets/src --spawn_strategy=standalone
```

It will throw an Error but still works until js bundle does't exist
TODO - fix it
