package:
	@web-ext build

	@echo -e '\nMozilla addon API credentials required.'
	@echo -e 'Check out https://addons.mozilla.org/en-US/developers/addon/api/key for your credentials.\n'
	@ \
	read -p '  * JWT issuer: ' amo_jwt_issuer; \
	read -p '  * JWT secret: ' -s amo_jwt_secret; \
	web-ext sign --api-key=$$amo_jwt_issuer --api-secret=$$amo_jwt_secret
