export const isOnLightPlan = (subscriptionsObject) => {
	if (subscriptionsObject === undefined) {
		return false;
	}
	if (subscriptionsObject.data === undefined) {
		return false;
	}
	const nowEpoch = Math.floor((new Date().valueOf() / 1000))
	for (let s of subscriptionsObject.data) {
		if (nowEpoch <= s.current_period_end) {
			for (let i of s.items.data) {
				const metadata = i.plan.metadata;
				if ('tier' in metadata) {
					if (metadata['tier'] === 'light') {
						return !isOnPremiumPlan(subscriptionsObject)
					}
				}
			}
		}
	}
	return false
};

export const isOnPremiumPlan = (subscriptionsObject) => {
	if (subscriptionsObject === undefined) {
		return false;
	}
	if (subscriptionsObject.data === undefined) {
		return false;
	}
	const nowEpoch = Math.floor((new Date().valueOf() / 1000))
	for (let s of subscriptionsObject.data) {
		if (nowEpoch <= s.current_period_end) {
			for (let i of s.items.data) {
				const metadata = i.plan.metadata;
				if ('tier' in metadata) {
					if (metadata['tier'] === 'premium') {
						return true
					}
				}
			}
		}
	}
	return false
};

export const getIfAllowSMSAlert = (subscriptionsObject) => {
	return isOnLightPlan(subscriptionsObject) || isOnPremiumPlan(subscriptionsObject)
};

export const getIfAllowWildcardSymbol = (subscriptionsObject) => {
	if (subscriptionsObject === undefined) {
		return false;
	}
	if (subscriptionsObject.data === undefined) {
		return false;
	}
	const nowEpoch = Math.floor((new Date().valueOf() / 1000))
	for (let s of subscriptionsObject.data) {
		if (nowEpoch <= s.current_period_end) {
			for (let i of s.items.data) {
				const metadata = i.plan.metadata;
				if ('tier' in metadata) {
					if (metadata['allow_wildcard_symbol']) {
						let allow = (metadata['allow_wildcard_symbol'].toLowerCase() === 'true');
						if (allow) {
							return true;
						}
					}
				}
			}
		}
	}
	return false
	
}

export const getAlertLimit = (subscriptionsObject) => {
	let alert_limit = 0;
	if (subscriptionsObject === undefined) {
		return alert_limit;
	}
	if (subscriptionsObject.data === undefined) {
		return alert_limit;
	}
	const nowEpoch = Math.floor((new Date().valueOf() / 1000))
	for (let s of subscriptionsObject.data) {
		if (nowEpoch <= s.current_period_end) {
			for (let i of s.items.data) {
				const metadata = i.plan.metadata;
				if ('tier' in metadata) {
					if (metadata['alert_limit']) {
						alert_limit = Math.max(alert_limit, parseInt(metadata['alert_limit'], 10))
					}
				}
			}
		}
	}
	return alert_limit
};
