import React, { ReactNode, useContext } from 'react';
import { ButtonBase, styled, useEventCallback } from '@mui/material';
import { ExploreContext } from '@site/src/pages/explore/_components/context';
import { HighlightBackground, HighlightContent } from '@site/src/pages/explore/_components/highlighted';
import { isNonemptyString } from '@site/src/utils/value';

export type QuestionCardVariant = 'recommended-card' | 'card' | 'text';

export interface QuestionCardProps {
  disabled?: boolean;
  variant?: QuestionCardVariant;
  question: ReactNode;
  questionId?: string | null;
  prefix?: string;
}

export default function QuestionCard ({ question, questionId, variant = 'card', prefix, disabled }: QuestionCardProps) {
  const { handleSelect, handleSelectId } = useContext(ExploreContext);

  const handleClick = useEventCallback(() => {
    if (isNonemptyString(questionId)) {
      handleSelectId(questionId);
    } else if (typeof question === 'string') {
      handleSelect(question);
    }
  });

  switch (variant) {
    case 'recommended-card':
      return (
        <HighlightBackground>
          <HighlightContent onClick={handleClick} disabled={disabled}>
            {question}
          </HighlightContent>
          <Marker>✨</Marker>
        </HighlightBackground>
      );
    case 'card':
      return (
        <HighlightContent onClick={handleClick} disabled={disabled}>
          {question}
        </HighlightContent>
      );
    default:
      return <Link disableRipple disableTouchRipple onClick={handleClick} disabled={disabled}>{prefix}{question}</Link>;
  }
}

const Link = styled(ButtonBase, { name: 'QuestionCard-Link' })`
  display: block;
  text-align: left;
  padding: 8px 0;
  font-size: 14px;
  line-height: 1.5;
  color: #c1c1c1;
  transition: ${({ theme }) => theme.transitions.create('color')};

  &:hover {
    color: white;
  }
`;

const Marker = styled('span')`
  position: absolute;
  right: 5px;
  bottom: 5px;
  font-size: 12px;
`;
