class Api::ChatMessagesController < ApplicationController
  before_action :authenticate_user!
  before_action :set_shift, only: [:index, :create]

  def index
    messages = @shift.chat_messages
                    .between_users(current_user.id, params[:recipient_id])
                    .ordered
    render json: messages
  end

  def create
    message = @shift.chat_messages.build(
      chat_message_params.merge(
        sender: current_user,
        recipient_id: params[:recipient_id]
      )
    )

    if message.save
      # In a real app, we would broadcast the message via ActionCable here
      render json: message, status: :created
    else
      render json: { errors: message.errors.full_messages }, status: :unprocessable_entity
    end
  end

  private

  def set_shift
    @shift = Shift.find(params[:shift_id])
  end

  def chat_message_params
    params.require(:chat_message).permit(:content)
  end
end 