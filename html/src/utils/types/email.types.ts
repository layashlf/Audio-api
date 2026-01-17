export interface EmailMessageRequest {
  to: string;
  subject: string;
  body: {
    [key: string]: string | any;
  } | string;
}
export interface EmailMessageResponse {
  to: string;
  from: string;
  subject: string;
  text: string;
  html: string;
}
