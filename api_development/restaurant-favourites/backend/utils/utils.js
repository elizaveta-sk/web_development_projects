function getStarredRestaurantInfo(allRestaurants, starredRestaurants) {
	return starredRestaurants.map(
		(starredRestaurant) => {
			const restaurant = allRestaurants.find(
				(restaurant) => restaurant.id === starredRestaurant.restaurantId
		);

		if (!restaurant) {
			return null;
		}

		return {
			id: starredRestaurant.id,
			comment: starredRestaurant.comment,
			name: restaurant.name,
		};
		}
	).filter(Boolean);
}

exports.getStarredRestaurantInfo = getStarredRestaurantInfo;
