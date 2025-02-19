import React, { useState, useEffect } from 'react';
import { connect } from 'react-redux';
import { useHistory } from 'react-router-dom';
import { SecureRoute, useOktaAuth } from '@okta/okta-react';
import { authenticateUser } from '../../state/actions/auth/authenticateUser';
import { getProfile } from '../../state/actions/userProfile/getProfile';
import Sidebar from './Sidebar/Sidebar';
import LoadingComponent from './LoadingComponent';

const PrivateRoute = ({
  component: Component,
  path,
  redirect,
  allowRoles, // should be an array of allowed role_id's i.e. [3, 4]
  isAuthenticated,
  profile_id,
  userProfile,
  dispatch,
  ...rest
}) => {
  const { push } = useHistory();
  const { authState, authService } = useOktaAuth();
  const [loading, setLoading] = useState(true); // hiding contents

  useEffect(() => {
    if (Object.keys(userProfile).length === 0) {
      if (profile_id === null) {
        if (authState.isPending || authState.isAuthenticated) {
          dispatch(authenticateUser(authState, authService));
        } else {
          push(redirect);
        }
      } else {
        dispatch(getProfile(profile_id));
      }
    } else if (allowRoles.includes(userProfile.role_id)) {
      setLoading(false);
    } else {
      push(redirect);
    }
  }, [
    isAuthenticated,
    userProfile,
    profile_id,
    allowRoles,
    redirect,
    dispatch,
    authService,
    authState,
    push,
  ]);

  return loading ? (
    <LoadingComponent />
  ) : (
    <Sidebar>
      <SecureRoute path={path} component={() => Component({ ...rest })} />
    </Sidebar>
  );
};

const mapStateToProps = state => ({
  isAuthenticated: state.user.auth.isAuthenticated,
  profile_id: state.user.auth.profile_id,
  userProfile: state.user.userProfile,
});

export default connect(mapStateToProps)(PrivateRoute);
