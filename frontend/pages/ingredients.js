import { adopt } from 'react-adopt';
import React from 'react';
import { Query, withApollo } from 'react-apollo';
import PropTypes from 'prop-types';
import styled from 'styled-components';

import AddNew from '../components/ingredients/AddNew';
import Containers from '../components/ingredients/Containers';
import ErrorMessage from '../components/ErrorMessage';
import Loading from '../components/Loading';
import Header from '../components/Header';
import Filters from '../components/ingredients/Filters';
import { GET_ALL_INGREDIENTS_QUERY, GET_INGREDIENTS_COUNT_QUERY } from '../lib/apollo/queries';

// TODO look into SSR config to see if i can serve the page with the aggregate baked in
const Composed = adopt({
	// eslint-disable-next-line react/prop-types
	getIngredients: ({ render }) => (
		<Query query={ GET_ALL_INGREDIENTS_QUERY }>
			{render}
		</Query>
	),

	// eslint-disable-next-line react/prop-types
	getIngredientCounts: ({ render }) => (
		<Query query={ GET_INGREDIENTS_COUNT_QUERY }>
			{render}
		</Query>
	),
});

const IngredientsPageStyles = styled.article`
`;

class Ingredients extends React.PureComponent {
	constructor(props) {
		super(props);

		this.state = { isAddNewExpanded: false };
	}

	onToggleAddNew = (e) => {
		e.preventDefault();
		const { isAddNewExpanded } = this.state;

		this.setState({ isAddNewExpanded: !isAddNewExpanded });
	}

	render() {
		console.warn('[ingredients] render');
		const { query } = this.props;
		const { isAddNewExpanded } = this.state;
		const { group = 'name', id = null, view = 'all' } = query;

		return (
			// eslint-disable-next-line
			<Composed variables={{ group, ingredientID: id, view }}>
				{
					({ getIngredients, getIngredientCounts }) => {
						const { error } = getIngredients || {};
						const { loading } = getIngredients || true;

						const { data } = getIngredientCounts || {};
						const { ingredientAggregate } = data || {};
						const { ingredientsCount, newIngredientsCount } = ingredientAggregate || {};

						// eslint-disable-next-line object-curly-newline
						console.log({ loadingIngredients: loading, loadingCounts: getIngredientCounts.loading });
						return (
							<IngredientsPageStyles>
								<Header pageHeader="Ingredients" />
								<section>
									<Filters
										group={ group }
										ingredientsCount={ ingredientsCount }
										newIngredientsCount={ newIngredientsCount }
										view={ view }
									/>

									{ (error) ? <ErrorMessage error={ error } /> : null }

									{
										(loading)
											? <Loading name="ingredients" />
											: (
												<Containers
													group={ group }
													ingredientID={ id }
													view={ view }
												/>
											)
									}

									<AddNew
										className={ `slide${ isAddNewExpanded ? '_expanded' : '' }` }
										onClick={ this.onToggleAddNew }
									/>
								</section>
							</IngredientsPageStyles>
						);
					}
				}
			</Composed>
		);
	}
}

Ingredients.defaultProps = {
	query: {
		group: 'name',
		id: null,
		view: 'all',
	},
};

Ingredients.propTypes = {
	query: PropTypes.shape({
		group: PropTypes.oneOf([ 'name', 'property', 'relationship', 'count' ]),
		id: PropTypes.string,
		view: PropTypes.oneOf([ 'all', 'new' ]),
	}),
};

export default withApollo(Ingredients);
