export { useGameState as useGame } from '../hooks/useGameState';

export function GameStateProvider({ children }) {
    // Zustand doesn't need a Provider for global state,
    // so we just passively render the children to avoid breaking App.jsx
    return children;
}
