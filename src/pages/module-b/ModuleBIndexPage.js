import { jsx as _jsx } from "react/jsx-runtime";
import { useNavigate } from 'react-router-dom';
import SubjectSelector from '../../components/SubjectSelector';
export default function ModuleBIndexPage() {
    const navigate = useNavigate();
    const handleSelect = (subject) => {
        const routeMap = {
            MATH: 'math',
            AOTh: 'aoth',
            AEPP: 'aepp',
        };
        navigate(`/tests/chapter/${routeMap[subject]}`);
    };
    return _jsx(SubjectSelector, { onSelect: handleSelect });
}
