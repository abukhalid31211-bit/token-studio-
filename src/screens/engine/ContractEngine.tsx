import { useState } from 'react';
import { Stepper } from '../../components/ui/Stepper';
import { TemplateStep } from './TemplateStep';
import { ConfigStep } from './ConfigStep';
import { CodeStep } from './CodeStep';
import { CompileStep } from './CompileStep';
import { DeployStep } from './DeployStep';
import { VerifyStep } from './VerifyStep';

/* حالة إعداد التوكن المشتركة بين الخطوات */
export interface EngineConfig {
  templateType: 'basic' | 'advanced' | 'full' | 'proxy';
  templateId: string | null;
  name: string;
  symbol: string;
  decimals: number;
  supply: string;
  maxSupply: string;
  unlimited: boolean;
  fn: { mint: boolean; burn: boolean; pause: boolean; blacklist: boolean; renounce: boolean };
  access: 'owner' | 'roles' | 'none';
  solVersion: string;
  optimizer: boolean;
  runs: string;
  evm: string;
  license: string;
}

export const DEFAULT_CONFIG: EngineConfig = {
  templateType: 'full',
  templateId: null,
  name: '',
  symbol: '',
  decimals: 6,
  supply: '1,000,000,000',
  maxSupply: '10,000,000,000',
  unlimited: false,
  fn: { mint: true, burn: true, pause: false, blacklist: false, renounce: false },
  access: 'owner',
  solVersion: 'v0.8.19',
  optimizer: true,
  runs: '200',
  evm: 'Paris',
  license: 'MIT',
};

export function ContractEngine() {
  const [step, setStep] = useState(1);
  const [cfg, setCfg] = useState<EngineConfig>(DEFAULT_CONFIG);
  const [contractAddr, setContractAddr] = useState<string | null>(null);

  const update = (patch: Partial<EngineConfig>) => setCfg((c) => ({ ...c, ...patch }));

  return (
    <div>
      <Stepper current={step} />

      {step === 1 && <TemplateStep cfg={cfg} update={update} onNext={() => setStep(2)} />}
      {step === 2 && <ConfigStep cfg={cfg} update={update} onBack={() => setStep(1)} onNext={() => setStep(3)} />}
      {step === 3 && <CodeStep cfg={cfg} onBack={() => setStep(2)} onNext={() => setStep(4)} />}
      {step === 4 && <CompileStep cfg={cfg} onBack={() => setStep(3)} onNext={() => setStep(5)} />}
      {step === 5 && (
        <DeployStep cfg={cfg} onBack={() => setStep(4)} onDeployed={(addr) => { setContractAddr(addr); }} onNext={() => setStep(6)} />
      )}
      {step === 6 && <VerifyStep cfg={cfg} contractAddr={contractAddr ?? 'TNew7Fake...AbCdEf'} onRestart={() => { setStep(1); setCfg(DEFAULT_CONFIG); setContractAddr(null); }} />}
    </div>
  );
}
