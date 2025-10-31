import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
import user from 'models/user.js';
import database from 'infra/database.js';
import emailConfirmation from 'models/email-confirmation.js';
import validator from 'models/validator.js';

vi.mock('infra/database.js', () => ({
  default: {
    query: vi.fn(),
  },
}));

vi.mock('models/email-confirmation.js', () => ({
  default: {
    createAndSendEmail: vi.fn(),
  },
}));

vi.mock('models/validator.js', () => ({
  default: vi.fn(),
}));

const mockedDatabaseQuery = vi.mocked(database.query);
const mockedEmailConfirmation = vi.mocked(emailConfirmation.createAndSendEmail);
const mockedValidator = vi.mocked(validator);

describe('models/user.js > update() [Unit Tests]', () => {
  const mockUserComplete = {
    id: 'user-id-123',
    username: 'testUser',
    email: 'test@example.com',
    password: 'hashedpassword',
    features: [],
  };

  const mockUserPartial = {
    id: 'user-id-123',
  };

  beforeEach(() => {
    vi.clearAllMocks();

    mockedValidator.mockImplementation((data) => data);

    mockedDatabaseQuery.mockResolvedValueOnce({ rowCount: 0 });

    mockedDatabaseQuery.mockResolvedValueOnce({ rowCount: 0 });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('[CT1] deve atualizar description, sem chamar findOneById, sem validar (D1.2, D2.4)', async () => {
    const postedData = { description: 'nova descricao' };
    const expectedUser = { ...mockUserPartial, ...postedData, tabcoins: 0, tabcash: 0 };

    mockedDatabaseQuery.mockResolvedValueOnce({
      rows: [expectedUser],
      rowCount: 1,
    });

    const result = await user.update(mockUserPartial, postedData, {});

    expect(emailConfirmation.createAndSendEmail).not.toHaveBeenCalled();
    
    expect(mockedDatabaseQuery).toHaveBeenCalledTimes(1);
    expect(result).toEqual(expectedUser);
  });

  it('[CT2] deve validar username, sem chamar findOneById, sem enviar email (D1.3, D2.2, D3.3)', async () => {
    const postedData = { username: 'novoUser' };
    const expectedUser = { ...mockUserComplete, ...postedData, tabcoins: 0, tabcash: 0 };

    mockedDatabaseQuery.mockResolvedValueOnce({
      rows: [expectedUser],
      rowCount: 1,
    });

    const result = await user.update(mockUserComplete, postedData, {});

    expect(emailConfirmation.createAndSendEmail).not.toHaveBeenCalled();

    expect(mockedDatabaseQuery).toHaveBeenCalledTimes(3); 
    expect(result).toEqual(expectedUser);
  });

  it('[CT3] deve chamar findOneById, validar email, e enviar email (D1.1, D2.3, D3.1)', async () => {
    const postedData = { email: 'novo@email.com' };
    const expectedUser = { ...mockUserComplete, tabcoins: 0, tabcash: 0 };

    mockedDatabaseQuery.mockResolvedValueOnce({
      rows: [mockUserComplete],
      rowCount: 1,
    });

    mockedDatabaseQuery.mockResolvedValueOnce({
      rows: [expectedUser],
      rowCount: 1,
    });

    const result = await user.update(mockUserPartial, postedData, {});

    expect(mockedDatabaseQuery).toHaveBeenCalledWith(
      expect.stringContaining('WHERE\n      \n        id = $1'),
      expect.anything()
    );

    expect(mockedEmailConfirmation).toHaveBeenCalledWith(
      mockUserComplete,
      'novo@email.com',
      expect.anything()
    );

    expect(mockedDatabaseQuery).toHaveBeenCalledTimes(4);
    expect(result).toEqual(expectedUser);
  });

  it('[CT4] deve validar email, NÃO chamar findOneById, NÃO enviar email (D1.3, D2.3, D3.2)', async () => {
    const postedData = { email: 'novo@email.com' };
    const options = { skipEmailConfirmation: true };
    const expectedUser = { ...mockUserComplete, ...postedData, tabcoins: 0, tabcash: 0 };

    mockedDatabaseQuery.mockResolvedValueOnce({
      rows: [expectedUser],
      rowCount: 1,
    });

    const result = await user.update(mockUserComplete, postedData, options);

    expect(emailConfirmation.createAndSendEmail).not.toHaveBeenCalled();

    expect(mockedDatabaseQuery).toHaveBeenCalledTimes(3);
    
    expect(result).toEqual(expectedUser);
    expect(result.email).toBe('novo@email.com');
  });
});