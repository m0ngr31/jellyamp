import _ from 'lodash';

const Notifications = {
  service: null,
  throttle: _.throttle(opts => (Notifications.service ? Notifications.service.open(opts) : null), 6000, {leading: true, trailing: false}),
};

export default Notifications;
