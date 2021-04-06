import _ from 'lodash';

export const Notifications = {
  service: null,
  throttle: _.throttle(opts => Notifications.service ? Notifications.service.open(opts) : null, 6000, {leading: true, trailing: false}),
};
