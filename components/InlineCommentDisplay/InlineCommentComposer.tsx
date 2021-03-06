import { StyleSheet } from "aphrodite";
import React from "react";
import TextEditor from "../TextEditor";

type Props = {
  isReadOnly: boolean;
  onCancel: () => void;
  onSubmit: (text: string, plainText: string) => void;
  placeholder?: string;
  textData: any; // this is a draftjs object
};

function InlineCommentComposer({
  isReadOnly,
  onCancel,
  onSubmit,
  placeholder,
  textData,
}: Props) {
  return (
    <TextEditor
      canEdit={true}
      commentEditor={!isReadOnly}
      commentEditorStyles={styles.commentEditorStyles}
      focusEditor={focus}
      mediaOnly={true}
      onCancel={onCancel}
      onSubmit={onSubmit}
      initialValue={textData}
      placeholder={placeholder || "What are your thoughts?"}
      readOnly={isReadOnly}
      smallToolBar={true}
    />
  );
}

var styles = StyleSheet.create({
  commentEditorStyles: {
    "@media only screen and (max-width: 415px)": {
      fontSize: 14,
    },
    "@media only screen and (max-width: 321px)": {
      fontSize: 12,
    },
  },
});

export default InlineCommentComposer;
