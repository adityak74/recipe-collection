import uuidv1 from 'uuid/v1';
import { hasProperty } from './util';

export const generateContainerByCount = (ingredientID = null, ingredients = []) => {
	let containers = [];

	// get the largest reference count from the bunch
	const upperBound = ingredients
		.map(i => i.referenceCount)
		.reduce((prev, current) => ((prev > current) ? prev : current));

	// determine exception categories for ingredients with 0 and/or 1 references
	const noReferences = (ingredients.filter(i => i.referenceCount === 0).length > 0) ? 1 : 0;
	const singularReference = (ingredients.filter(i => i.referenceCount === 1).length > 0) ? 1 : 0;

	// determine number of groups needed outside of our two exception groups
	let containerSize = (upperBound > 1) ? Math.ceil(upperBound / 10) : 0;
	containerSize += noReferences + singularReference;

	let rangeStart = 2;
	let rangeEnd = 10;

	containers = [ ...Array(containerSize) ];
	containers = containers.map((c, index) => {
		let containerIngredients = [];

		// 0 References
		if ((index === 0) && noReferences) {
			containerIngredients = ingredients.filter(i => i.referenceCount === 0);
			return {
				__typename: 'Container',
				count: containerIngredients.length,
				id: uuidv1(),
				ingredientID,
				ingredients: containerIngredients,
				isExpanded: false,
				label: '0 References',
			};
		}

		// 1 Reference
		if ((index === 0 && !noReferences) || (index === 1 && noReferences)) {
			containerIngredients = ingredients.filter(i => i.referenceCount === 1);

			return {
				__typename: 'Container',
				count: containerIngredients.length,
				id: uuidv1(),
				ingredientID,
				ingredients: containerIngredients,
				isExpanded: false,
				label: '1 Reference',
			};
		}

		// 2+ References
		// adjust the index based on whether we have any exception groups
		const adjustedIndex = (index - noReferences - singularReference);
		if (adjustedIndex > 0) {
			rangeStart = (adjustedIndex * 10) + 1;
			rangeEnd = (adjustedIndex * 10) + 10;
		}

		containerIngredients = ingredients.filter(i => i.referenceCount >= rangeStart && i.referenceCount <= rangeEnd);

		return {
			__typename: 'Container',
			count: containerIngredients.length,
			id: uuidv1(),
			ingredientID,
			ingredients: containerIngredients,
			isExpanded: false,
			label: `${ rangeStart }-${ rangeEnd } References`,
		};
	}).filter(c => c.ingredients.length > 0);

	return containers;
};

export const generateContainerByName = (ingredientID = null, ingredients = [], view) => {
	let containers = [];
	let pagerLabels = [];

	// if we have less than 500 ingredients, display them in a single container
	if (ingredients.length <= 500) {
		containers.push({
			__typename: 'Container',
			count: ingredients.length,
			id: uuidv1(),
			ingredientID,
			ingredients,
			isExpanded: true,
			label: (view === 'search')
				? 'Search Results'
				: `${ view.charAt(0).toUpperCase() + view.slice(1) } Ingredients`,
		});
	// otherwise break up into containers by letter
	} else {
		// create an array of unique letters used
		pagerLabels = ingredients.map(i => i.name.charAt(0))
			.filter((char, index, self) => self.indexOf(char) === index && char.match(/[a-z]/i));

		const containsSymbols = ingredients.map(i => i.name.charAt(0)).filter(char => !char.match(/[a-z]/i)).length > 0;
		if (containsSymbols) {
			pagerLabels.unshift('@');
		}

		containers = pagerLabels.map((char) => {
			const containerIngredients = (char === '@')
				? ingredients.filter(i => !i.name.charAt(0).match(/[a-z]/i))
				: ingredients.filter(i => i.name.charAt(0) === char);

			return {
				__typename: 'Container',
				count: containerIngredients.length,
				id: uuidv1(),
				ingredientID,
				ingredients: containerIngredients,
				isExpanded: true,
				label: char,
			};
		});
	}

	return containers;
};

export const generateContainerByProperty = (ingredientID = null, ingredients = []) => {
	const labels = [ 'meat', 'poultry', 'fish', 'dairy', 'soy', 'gluten', 'other' ];

	return labels.map((label) => {
		let containerIngredients = [];

		if (label !== 'other') {
			containerIngredients = ingredients.filter(i => hasProperty(i.properties, label) && i.properties[label]);
		} else {
			containerIngredients = ingredients.filter(i => Object.values(i.properties).filter(value => (value !== 'Properties') && value).length === 0);
		}

		if (containerIngredients.length > 0) {
			return {
				__typename: 'Container',
				count: containerIngredients.length,
				id: uuidv1(),
				ingredientID,
				ingredients: containerIngredients,
				isExpanded: true,
				label: label.charAt(0).toUpperCase() + label.slice(1),
			};
		} return null;
	}).filter(c => c);
};

export const generateContainerByRelationship = (ingredientID = null, ingredients = []) => {
	const containers = [];
	const parentIngredients = ingredients.filter(i => !i.hasParent);
	const childIngredients = ingredients.filter(i => i.hasParent);

	if (childIngredients.length > 0) {
		containers.push({
			__typename: 'Container',
			count: childIngredients.length,
			id: uuidv1(),
			ingredientID,
			ingredients: childIngredients,
			isExpanded: true,
			label: 'Child Ingredients',
		});
	}

	if (parentIngredients.length > 0) {
		containers.push({
			__typename: 'Container',
			count: childIngredients.length,
			id: uuidv1(),
			ingredientID,
			ingredients: childIngredients,
			isExpanded: true,
			label: 'Parent Ingredients',
		});
	}

	return containers;
};

export default [
	generateContainerByCount,
	generateContainerByName,
	generateContainerByProperty,
	generateContainerByRelationship,
];
