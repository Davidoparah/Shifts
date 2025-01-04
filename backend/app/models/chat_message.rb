class ChatMessage < ApplicationRecord
  belongs_to :shift
  belongs_to :sender, class_name: 'User'
  belongs_to :recipient, class_name: 'User'

  validates :content, presence: true
  validates :sender_name, presence: true

  before_validation :set_sender_name, on: :create

  scope :for_shift, ->(shift_id) { where(shift_id: shift_id) }
  scope :between_users, ->(user1_id, user2_id) {
    where(sender_id: [user1_id, user2_id], recipient_id: [user1_id, user2_id])
  }
  scope :ordered, -> { order(created_at: :asc) }

  private

  def set_sender_name
    self.sender_name = sender.name if sender
  end
end 