import { CompanyProfileService } from './company-profile.service';

describe('CompanyProfileService', () => {
  it('responde de forma curta quando a consulta nao pede um produto especifico', async () => {
    const service = new CompanyProfileService();

    const answer = await service.getAnswer('oi tudo bem?');

    expect(answer).toContain('Claro! Não encontrei um produto específico.');
    expect(answer).toContain('Posso sugerir Smartphones, Notebooks, Games.');
    expect(answer).toContain('marca, faixa de preço ou condição');
  });

  it('continua trazendo a seção correta quando a consulta pede informacao da loja', async () => {
    const service = new CompanyProfileService();

    const answer = await service.getAnswer('qual o horario de funcionamento?');

    expect(answer).toContain('Horário de atendimento');
    expect(answer).toContain('Segunda a sexta: 9h às 18h');
  });
});
