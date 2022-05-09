#!/bin/bash

source secrets.bash
wrangler pages dev functions \
  -b GOOGLE_CLIENT_ID=${GOOGLE_CLIENT_ID} \
  -b GOOGLE_CLIENT_SECRET=${GOOGLE_CLIENT_SECRET} \
  -b APP_HOST=http://localhost:3000 \
  -b API_HOST=http://localhost:8788 \
  --local \
  --proxy 3000 \
  --kv ROAM_CO_OP
