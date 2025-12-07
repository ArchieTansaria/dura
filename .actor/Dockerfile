FROM apify/actor-node-playwright:latest

# Copy all sources
COPY . ./

# Install dependencies
RUN npm install --production

# Run the actor
CMD ["npm", "start"]
