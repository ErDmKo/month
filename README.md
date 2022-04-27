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