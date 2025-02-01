class UpdateBusiness
  def self.up
    business = Business.first
    if business
      business.update(
        phone: '1234567890',  # Replace with actual phone number
        address: '123 Main St, City, State 12345',  # Replace with actual address
        owner_id: User.where(role: 'business_owner').first&.id
      )
      puts "Business updated successfully: #{business.inspect}"
    else
      puts "No business found to update"
    end
  rescue => e
    puts "Error updating business: #{e.message}"
  end
end 