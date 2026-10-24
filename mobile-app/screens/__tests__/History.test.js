import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

import HistoryScreen from '../History';
import Expenses from '../../utils/expenses';

const navigation = { goBack: jest.fn() };

const anExpense = (id, label, amount) => ({
  id,
  label,
  amount,
  savedAt: 1792800000000,
  split: [
    { name: 'alex', owes: amount * 0.6, pct: 60 },
    { name: 'sam', owes: amount * 0.4, pct: 40 },
  ],
});

const save = (expense) => new Promise(resolve => Expenses.add(expense, resolve));

// Arms the delete button and commits, which is the two taps the screen demands.
const deleteSelection = async () => {
  await fireEvent.press(screen.getByText(/^Delete/));
  await fireEvent.press(await screen.findByText(/^Tap again to delete/));
};

const anchorOf = () =>
  screen.getByTestId('history-list').props.maintainVisibleContentPosition;

beforeEach(async () => {
  await AsyncStorage.clear();
});

describe('History', () => {
  it('leaves the surviving expense on screen when one of two is deleted', async () => {
    await save(anExpense('rent-1', 'rent', 1200));
    await save(anExpense('pizza-1', 'pizza', 24));

    await render(<HistoryScreen navigation={navigation} />);

    expect(await screen.findByText('pizza')).toBeTruthy();
    expect(screen.getByText('rent')).toBeTruthy();

    await fireEvent.press(screen.getByLabelText('select pizza'));
    await deleteSelection();

    await waitFor(() => expect(screen.queryByText('pizza')).toBeNull());

    expect(screen.getByText('rent')).toBeTruthy();
    expect(screen.getByText(/^1 expense,/)).toBeTruthy();
  });

  // The anchor shifts the scroll offset when a row above it disappears. With every row loaded
  // there is nothing above to page in, and deleting the first row left the list scrolled past its
  // own content: blank until the app restarted.
  it('holds no scroll anchor while the whole history is loaded', async () => {
    await save(anExpense('rent-1', 'rent', 1200));
    await save(anExpense('pizza-1', 'pizza', 24));

    await render(<HistoryScreen navigation={navigation} />);
    await screen.findByText('pizza');

    expect(anchorOf()).toBeUndefined();

    await fireEvent.press(screen.getByLabelText('select pizza'));
    await deleteSelection();
    await waitFor(() => expect(screen.queryByText('pizza')).toBeNull());

    expect(anchorOf()).toBeUndefined();
  });

  it('shows the empty state once the last expense goes', async () => {
    await save(anExpense('pizza-1', 'pizza', 24));

    await render(<HistoryScreen navigation={navigation} />);
    await screen.findByText('pizza');

    await fireEvent.press(screen.getByLabelText('select pizza'));
    await deleteSelection();

    expect(await screen.findByText(/Nothing saved yet/)).toBeTruthy();
  });
});
