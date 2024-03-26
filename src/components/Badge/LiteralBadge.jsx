import React from 'react';
import Tags from '../Tags/Common/Tags';
import TooltipStyled from '../Tooltip/TooltipStyled';

const LiteralBadge = ({ tagTitle, promptText = 'promptText' }) => {
  return (
    <div className="literal-badge">
      <TooltipStyled title={promptText}>
        <Tags>{tagTitle}</Tags>
      </TooltipStyled>
    </div>
  );
};

export default LiteralBadge;
