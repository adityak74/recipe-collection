import PropTypes from 'prop-types';
import React, { useContext } from 'react';
import pure from 'recompose/pure';
import styled from 'styled-components';

import CardContext from '../../../../lib/contexts/ingredients/cardContext';
import withFieldSet from '../withFieldSet';
import Input from '../../../common/Input';

const References = ({ loading, onChange, value }) => {
	const ctx = useContext(CardContext);
	const isEditMode = ctx.get('isEditMode');
	console.log({ value });

	return (
		<LabelStyles>
			References
		</LabelStyles>
	);
};

References.defaultProps = {
	loading: false,
	onChange: (e) => e.preventDefault(),
	value: '',
};

References.whyDidYouRender = true;

References.propTypes = {
	loading: PropTypes.bool,
	onChange: PropTypes.func,
	value: PropTypes.shape({ toJS: PropTypes.func }),
};

export default withFieldSet(pure(References));

const LabelStyles = styled.label`
`;
