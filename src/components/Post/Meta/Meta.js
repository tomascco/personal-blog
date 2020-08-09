// @flow strict
import React from 'react';
import moment from 'moment';
import 'moment/locale/pt-br';
import styles from './Meta.module.scss';

type Props = {
  date: string
};

moment.locale('pt-br');

const Meta = ({ date }: Props) => (
  <div className={styles['meta']}>
    <p className={styles['meta__date']}>Published {moment(date).format('D MMM YYYY')}</p>
  </div>
);

export default Meta;
