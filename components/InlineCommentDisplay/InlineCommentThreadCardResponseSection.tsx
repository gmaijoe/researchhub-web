import { connect } from "react-redux";
import { css, StyleSheet } from "aphrodite";
import { EditorState } from "draft-js";
import { emptyFncWithMsg, silentEmptyFnc } from "../../config/utils/nullchecks";
import { ID } from "../../config/types/root_types";
import { MessageActions } from "../../redux/message";
import { ModalActions } from "../../redux/modals";
import { saveCommentToBackend } from "./api/InlineCommentCreate";
import DiscussionPostMetadata from "../DiscussionPostMetadata.js";
import InlineCommentComposer from "./InlineCommentComposer";
import InlineCommentUnduxStore, {
  cleanupStoreAndCloseDisplay,
  getSavedInlineCommentsGivenBlockKey,
} from "../PaperDraftInlineComment/undux/InlineCommentUnduxStore";
import PaperDraftUnduxStore from "../PaperDraft/undux/PaperDraftUnduxStore";
import React, { ReactElement, useEffect, useState } from "react";

type Props = {
  auth: any /* redux */;
  showMessage: any /* redux */;
  setMessage: any /* redux function to set a message */;
  openRecaptchaPrompt: any /* redux function to open recaptcha */;
  commentData: Array<any>;
  commentThreadID: ID;
  currBlockKey: ID;
  isActive?: boolean;
};

/* DEPRECATED */
function InlineCommentThreadCardResponseSection({
  auth,
  showMessage,
  setMessage,
  openRecaptchaPrompt: _openRecaptchaPrompt,
  commentData,
  commentThreadID,
  currBlockKey,
  isActive = false,
}: Props): ReactElement<"div"> {
  const inlineCommentStore = InlineCommentUnduxStore.useStore();
  const paperDraftStore = PaperDraftUnduxStore.useStore();
  const paperID = inlineCommentStore.get("paperID");

  const [shouldShowComposer, setShouldShowComposer] = useState<boolean>(
    isActive
  );

  useEffect((): void => {
    setShouldShowComposer(isActive);
  }, [isActive]);

  const onSubmitResponses = (text: string, plainText: string) => {
    showMessage({ load: true, show: true });
    saveCommentToBackend({
      auth,
      onError: emptyFncWithMsg,
      onSuccess: ({ threadID }: { threadID: ID }): void => {
        inlineCommentStore.set("displayableInlineComments")(
          getSavedInlineCommentsGivenBlockKey({
            blockKey: String(currBlockKey),
            editorState:
              paperDraftStore.get("editorState") || EditorState.createEmpty(),
          })
        );
      },
      paperID,
      params: {
        text,
        parent: commentThreadID,
        plain_text: plainText,
      },
      setMessage,
      showMessage,
      threadID: commentThreadID,
    });
  };

  const commentResponses =
    commentData.length > 0
      ? commentData.map((commentData, i: number) => {
          return (
            <div>
              <DiscussionPostMetadata
                authorProfile={commentData.created_by.author_profile} // @ts-ignore
                data={{
                  created_by: commentData.created_by,
                }}
                username={
                  commentData.created_by.author_profile.first_name +
                  " " +
                  commentData.created_by.author_profile.last_name
                }
                noTimeStamp={true}
                smaller={true}
              />
              <InlineCommentComposer
                isReadOnly={true}
                key={`thread-response-${commentData.id}-${i}`}
                onCancel={silentEmptyFnc}
                onSubmit={silentEmptyFnc}
                textData={commentData ? commentData.text : null}
              />
            </div>
          );
        })
      : null;

  return (
    <div className={css(styles.inlineCommentThreadCardResponseSection)}>
      <div className={css(styles.threadResponsesWrap)}>{commentResponses}</div>
      {shouldShowComposer && (
        <div className={css(styles.threadResponseComposerWrap)}>
          <InlineCommentComposer
            isReadOnly={false}
            onCancel={(): void => {
              cleanupStoreAndCloseDisplay({ inlineCommentStore });
            }}
            onSubmit={onSubmitResponses}
            placeholder={"Respond to comment above"}
            textData={null} /* initial response composer should be empty */
          />
        </div>
      )}
    </div>
  );
}

const styles = StyleSheet.create({
  inlineCommentThreadCardResponseSection: {},
  replyIcon: {
    color: "#918f9b",
    marginRight: 8,
  },
  responseText: {
    fontFamily: "Roboto",
    fontSize: 14,
    color: "#AAAAAA",
    "@media only screen and (max-width: 415px)": {
      fontSize: 12,
    },
  },
  textBump: {
    marginBottom: 2,
  },
  threadResponsesWrap: { display: "flex", flexDirection: "column" },
  threadResponseComposerWrap: { marginBottom: 8 },
});

const mapStateToProps = ({ auth }: any) => ({
  auth,
});

const mapDispatchToProps = {
  showMessage: MessageActions.showMessage,
  setMessage: MessageActions.setMessage,
  openRecaptchaPrompt: ModalActions.openRecaptchaPrompt,
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(InlineCommentThreadCardResponseSection);
