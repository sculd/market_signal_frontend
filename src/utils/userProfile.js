export const isOnLightPlan = (subscriptionsObject) => {
	if (subscriptionsObject === undefined) {
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

