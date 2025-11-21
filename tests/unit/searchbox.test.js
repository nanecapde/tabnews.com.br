import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import { describe, it, expect, beforeEach, afterAll, vi } from 'vitest';
import { ThemeProvider } from '@primer/react';
import useSearchBox from '/pages/interface/components/Searchbox/index.js';
vi.stubGlobal('MutationObserver', class {
  observe() {}
  disconnect() {}
});
function TestComponent() {
  const { SearchBoxOverlay } = useSearchBox();
  return (
    <ThemeProvider>
      <SearchBoxOverlay />
    </ThemeProvider>
  );
}
describe('SearchBox Component', () => {
  const originalLocation = window.location;
  beforeEach(() => {
    Object.defineProperty(window, 'location', {
      configurable: true,
      value: { ...originalLocation, search: '' },
    });
  });
  afterAll(() => {
    Object.defineProperty(window, 'location', {
      configurable: true,
      value: originalLocation,
    });
    vi.unstubAllGlobals();
  });
  it('deve iniciar ABERTO se houver um termo de busca na URL (Simulando Voltar)', () => {
    Object.defineProperty(window, 'location', {
      configurable: true,
      value: { ...originalLocation, search: '?q=teste+tdd' },
    });
    render(<TestComponent />);
    const searchTitle = screen.queryByText(/Pesquisar com o Google/i);
    expect(searchTitle).toBeInTheDocument();
  });
  it('deve iniciar FECHADO se NÃO houver termo de busca na URL', () => {
    Object.defineProperty(window, 'location', {
      configurable: true,
      value: { ...originalLocation, search: '' },
    });
    render(<TestComponent />);
    const searchTitle = screen.queryByText(/Pesquisar com o Google/i);
    expect(searchTitle).not.toBeInTheDocument();
  });
});
