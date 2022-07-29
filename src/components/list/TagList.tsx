import React from "react";
import { Tag } from "../text/Tag";

interface TagListProps {
  tags: string[];
  style?: React.CSSProperties;
  className?: string;
}

export const TagList = ({ tags, className, style }: TagListProps) => {
  return (
    <div>
      {tags.map((tag) => (
        <Tag key={tag} className={className} style={style}>
          {tag}
        </Tag>
      ))}
    </div>
  );
};
