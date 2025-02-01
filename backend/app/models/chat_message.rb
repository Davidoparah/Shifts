class ChatMessage
  include Mongoid::Document
  include Mongoid::Timestamps

  field :content, type: String
  field :sender_name, type: String
  field :read, type: Boolean, default: false
  field :message_type, type: String, default: 'text'
  field :metadata, type: Hash, default: {}

  belongs_to :shift
  belongs_to :sender, class_name: 'User'
  belongs_to :recipient, class_name: 'User'

  validates :content, presence: true
  validates :sender_name, presence: true

  index({ shift_id: 1 })
  index({ sender_id: 1 })
  index({ recipient_id: 1 })
  index({ created_at: 1 })
  index({ read: 1 })

  before_validation :set_sender_name, on: :create

  scope :for_shift, ->(shift_id) { where(shift_id: shift_id) }
  scope :between_users, ->(user1_id, user2_id) {
    where(sender_id: [user1_id, user2_id], recipient_id: [user1_id, user2_id])
  }
  scope :ordered, -> { order(created_at: :asc) }
  scope :unread, -> { where(read: false) }

  def mark_as_read
    update(read: true)
  end

  def mark_as_unread
    update(read: false)
  end

  private

  def set_sender_name
    self.sender_name = sender.name if sender
  end
end 