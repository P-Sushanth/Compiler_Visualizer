import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Sidebar } from '../Sidebar';
import { useUIStore } from '@/store/uiStore';
import React from 'react';

describe('Sidebar Component', () => {
  beforeEach(() => {
    // Reset Zustand store state before each test
    useUIStore.setState({ activeStage: 'lexer' });
  });

  it('renders all stage navigation buttons', () => {
    render(<Sidebar />);

    expect(screen.getByRole('navigation', { name: /compiler stages navigation/i })).toBeInTheDocument();
    expect(screen.getByTitle('Lexical Analysis')).toBeInTheDocument();
    expect(screen.getByTitle('Syntax Analysis (AST)')).toBeInTheDocument();
    expect(screen.getByTitle('Semantic Analysis')).toBeInTheDocument();
    expect(screen.getByTitle('Intermediate Representation')).toBeInTheDocument();
    expect(screen.getByTitle('Optimization Passes')).toBeInTheDocument();
    expect(screen.getByTitle('Assembly Generation')).toBeInTheDocument();
    expect(screen.getByTitle('Transformation Diff')).toBeInTheDocument();
  });

  it('highlights the active stage button', () => {
    render(<Sidebar />);
    
    const lexButton = screen.getByRole('button', { name: /view lexical analysis stage/i });
    expect(lexButton).toHaveAttribute('aria-pressed', 'true');

    const astButton = screen.getByRole('button', { name: /view syntax analysis \(ast\) stage/i });
    expect(astButton).toHaveAttribute('aria-pressed', 'false');
  });

  it('updates the active stage in the store when a button is clicked', async () => {
    const user = userEvent.setup();
    render(<Sidebar />);

    const astButton = screen.getByRole('button', { name: /view syntax analysis \(ast\) stage/i });
    await user.click(astButton);

    // Verify UI store was updated
    expect(useUIStore.getState().activeStage).toBe('parser');
  });
});
