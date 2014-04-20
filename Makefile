test:
	@NODE_ENV=test ./node_modules/.bin/mocha \
		--require should \
		--reporter spec \
		--timeout 100000 \
		test.js

.PHONY: test