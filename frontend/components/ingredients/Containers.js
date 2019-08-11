import React from 'react';
import { adopt } from 'react-adopt';
import { Query, withApollo } from 'react-apollo';
import PropTypes from 'prop-types';
import styled from 'styled-components';

import Container from './Container';
import ErrorMessage from '../ErrorMessage';
import { GET_CONTAINERS_QUERY } from '../../lib/apollo/queries';

const ContainerStyles = styled.div`
	display: flex;
	flex-wrap: wrap;
	margin: 20px 0;

	&.hidden {
		border-bottom: 0;
	}

	ul.hidden {
		display: none;
	}
`;

const Composed = adopt({
	// eslint-disable-next-line react/prop-types
	getContainers: ({ group, ingredientID, render, view }) => (
		// eslint-disable-next-line object-curly-newline
		<Query query={ GET_CONTAINERS_QUERY } variables={ { group, ingredientID, view } }>
			{ render }
		</Query>
	),
});

class Containers extends React.PureComponent {
	// TODO i might need to toggle a separate mutation to set ingredientID within the appropriate containers
	render() {
		console.warn('[Containers] render');
		const { group, ingredientID, view } = this.props;

		return (// TODO do i need to adjust the fetchPolicy here?
			// TODO GET_CONTAINERS_QUERY ONLY NEEDS TO RETURN AN ID NOW
			// eslint-disable-next-line object-curly-newline
			<Composed group={ group } ingredientID={ ingredientID } view={ view }>
				{
					({ getContainers }) => {
						const { loading, error, data } = getContainers;
						if (loading) return null;
						if (error) return <ErrorMessage error={ error } />;
						const { containers } = data;

						return (
							<ContainerStyles>
								{
									containers.filter(ctn => ctn.ingredients && (ctn.ingredients.length > 0))
										.map(c => (
											<Container
												group={ group }
												id={ c.id }
												key={ c.id }
												view={ view }
											/>
										))
								}
							</ContainerStyles>
						);
					}
				}
			</Composed>
		);
	}
}

Containers.defaultProps = {
	group: 'name',
	ingredientID: null,
	view: 'all',
};

Containers.propTypes = {
	group: PropTypes.oneOf([ 'name', 'property', 'relationship', 'count' ]),
	ingredientID: PropTypes.string,
	view: PropTypes.oneOf([ 'all', 'new' ]),
};

export default withApollo(Containers);
