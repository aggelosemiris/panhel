import React from 'react';
import { useNavigate } from 'react-router-dom';
import SubjectSelector from '../../components/SubjectSelector';

export default function ModuleBIndexPage() {
  const navigate = useNavigate();

  const handleSelect = (subject: 'MATH' | 'AOTh' | 'AEPP') => {
    const routeMap = {
      MATH: 'math',
      AOTh: 'aoth',
      AEPP: 'aepp',
    };

    navigate(`/tests/chapter/${routeMap[subject]}`);
  };

  return <SubjectSelector onSelect={handleSelect} />;
}
